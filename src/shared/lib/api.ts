import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { configureStore } from "@reduxjs/toolkit";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { handleSessionExpired } from "./session";

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface RequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  responseType?: "json" | "blob" | "text";
  timeout?: number;
}

interface CompatResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

interface CompatError<T = unknown> extends Error {
  isAxiosError: boolean;
  response: {
    status: number;
    data: T;
    headers: Record<string, string>;
    config: Record<string, unknown>;
  };
  config: Record<string, unknown>;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithSession: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  handleSessionExpired(result.error);
  return result;
};

const httpApi = createApi({
  reducerPath: "httpApi",
  baseQuery: baseQueryWithSession,
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
  endpoints: (build) => ({
    request: build.query<any, FetchArgs>({
      query: (args) => args,
      keepUnusedDataFor: 0,
    }),
    mutate: build.mutation<any, FetchArgs>({
      query: (args) => args,
    }),
  }),
});

const httpStore = configureStore({
  reducer: { [httpApi.reducerPath]: httpApi.reducer },
  middleware: (getDefault) => getDefault().concat(httpApi.middleware),
  devTools: false,
});

async function compatRequest<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD",
  url: string,
  body?: unknown,
  config?: RequestOptions,
): Promise<CompatResponse<T>> {
  const {
    params,
    headers: customHeaders = {},
    responseType = "json",
    timeout,
  } = config || {};

  const headers: Record<string, string> = { ...customHeaders };
  // Content-Type is left to the browser for multipart/form-data (FormData
  // bodies need the correct multipart boundary).
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const args: FetchArgs = {
    url,
    method,
    params: params as Record<string, unknown>,
    headers,
  };
  if (body !== undefined) (args as FetchArgs & { body: unknown }).body = body;
  if (responseType === "blob") {
    (
      args as { responseHandler?: (r: Response) => Promise<Blob> }
    ).responseHandler = (r: Response) => r.blob();
  } else if (responseType === "text") {
    (args as { responseHandler?: "text" }).responseHandler = "text";
  }

  const isQuery = method === "GET" || method === "HEAD";
  const action = isQuery
    ? httpApi.endpoints.request.initiate(args, { forceRefetch: true })
    : httpApi.endpoints.mutate.initiate(args);

  const result = (await httpStore.dispatch(action as never)) as {
    data?: T;
    error?: { status?: number | string; data?: unknown };
    meta?: { response?: Response };
  };
  const compatConfig = {
    method,
    url,
    params,
    headers: customHeaders,
    timeout,
    responseType,
  };

  if (result.error) {
    const status =
      typeof result.error.status === "number" ? result.error.status : 0;
    const err: CompatError = new Error(
      `Request failed with status code ${status}`,
    ) as CompatError;
    err.isAxiosError = true;
    err.config = compatConfig;
    err.response = {
      status,
      data: result.error.data,
      headers: {},
      config: compatConfig,
    };
    throw err;
  }

  const resHeaders: Record<string, string> = {};
  result.meta?.response?.headers?.forEach((value, key) => {
    resHeaders[key] = value;
  });

  return {
    data: result.data as T,
    status: result.meta?.response?.status ?? 200,
    statusText: result.meta?.response?.statusText || "",
    headers: resHeaders,
    config: compatConfig,
  };
}

// Axios-compatible facade backed by RTK Query. `res.data` / `error.response.status`
// shapes are preserved so existing call sites keep working unchanged.
const api = {
  get: <T = any>(url: string, config?: RequestOptions) =>
    compatRequest<T>("GET", url, undefined, config),
  post: <T = any>(url: string, body?: unknown, config?: RequestOptions) =>
    compatRequest<T>("POST", url, body, config),
  put: <T = any>(url: string, body?: unknown, config?: RequestOptions) =>
    compatRequest<T>("PUT", url, body, config),
  delete: <T = any>(url: string, config?: RequestOptions) =>
    compatRequest<T>("DELETE", url, undefined, config),
  patch: <T = any>(url: string, body?: unknown, config?: RequestOptions) =>
    compatRequest<T>("PATCH", url, body, config),
  defaults: { baseURL: API_BASE },
};

export default api;

// Test surface — the RTK Query transport + adapter internals.
export { httpApi, httpStore, compatRequest };
export type { CompatResponse, CompatError, RequestOptions };
