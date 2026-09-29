import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { TokenStore } from "@shared/auth/tokenStore";

export const API_URL =
  (import.meta.env?.VITE_API_URL as string | undefined) ??
  "http://localhost:5001/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = TokenStore.get();
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("content-type", "application/json");
    return headers;
  },
});

export type CustomBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

/**
 * Base query with 401 handling. When a session expires the token is cleared
 * and the caller (route guard / slice listener) routes back to login.
 */
const baseQueryWithAuth: CustomBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    TokenStore.clear();
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Auth",
    "AuthUser",
    "Instances",
    "Directory",
    "EffectiveAccess",
    "ReportingLine",
    "EngineerProfile",
    "Delegations",
    "AssignedWork",
    "WorkHistory",
    "Sessions",
    "Audit",
    "Teams",
    "Roles",
    "OrgUnits",
    "ItsmWork",
    "ItsmAudit",
  ],
  endpoints: () => ({}),
});
