import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { TokenStore } from "@services/auth/tokenStore";
import { logout } from "@services/auth/authSlice";

/**
 * Base URL for the shared backend API.
 *
 * The Express backend mounts its entire surface under `env.API_PREFIX`
 * (`/api/v1`), so every feature API reuses this value.
 */
export const API_URL =
  (import.meta.env?.VITE_API_URL as string | undefined) ??
  "http://localhost:3008/api/v1";

// ── Response envelope ───────────────────────────────────────────────────────
//
// Every backend response is wrapped:
//   success: { success: true,  data, meta? }
//   error:   { success: false, error: { code, message, details? } }
//
// Hooks resolve to the *full envelope* (`ApiSuccess<T>`) so list payloads keep
// their `meta` pagination block.

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    meta?: Record<string, unknown>;
  };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = TokenStore.get();
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (!headers.has("content-type"))
      headers.set("content-type", "application/json");
    return headers;
  },
});

export type AuthBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

/**
 * Endpoints whose own 401 means "bad credentials", not "expired session" —
 * a 401 from these must never trigger a refresh attempt or clear a session.
 */
const CREDENTIAL_URLS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/mfa/verify",
  "/auth/invitation/accept",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function requestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

/**
 * Single in-flight refresh shared by every request that hits a 401 at the
 * same moment (e.g. a dashboard firing seven parallel queries), so only one
 * `POST /auth/refresh` runs and all callers await its outcome.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = TokenStore.getRefresh();
  if (!refreshToken) return false;
  // Plain fetch (not rawBaseQuery): the refresh must not inherit the original
  // request's abort signal or attach the stale access token.
  let body: unknown;
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    body = await response.json();
  } catch {
    return false;
  }
  const session = (
    body as { data?: { accessToken?: unknown; refreshToken?: unknown } } | null
  )?.data;
  if (!session || typeof session.accessToken !== "string") return false;
  TokenStore.set(session.accessToken);
  if (typeof session.refreshToken === "string") {
    TokenStore.setRefresh(session.refreshToken);
  }
  return true;
}

/**
 * Attaches the auth handler: on a 401 it first attempts one shared silent
 * refresh (`POST /auth/refresh` with the stored refresh token) and retries
 * the original request. If refresh is impossible or fails, the session is
 * cleared and `logout()` dispatches so the route guard returns the user to
 * sign-in.
 */
export const baseQueryWithAuth: AuthBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;
  if (CREDENTIAL_URLS.some((path) => requestUrl(args).startsWith(path))) {
    return result;
  }

  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  const refreshed = await refreshInFlight;
  if (!refreshed) {
    api.dispatch(logout());
    return result;
  }

  result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(logout());
  return result;
};

/**
 * Extracts a human-readable message from an API error.
 *
 * Accepts both shapes callers use today:
 *   - the response envelope itself  `{ success, error: { message } }`
 *   - the raw RTK rejection value   `{ status, data: <envelope> }`
 * so server validation messages are never discarded as "Request failed".
 */
export function apiErrorMessage(payload: unknown): string {
  let source: unknown = payload;
  if (source && typeof source === "object" && "data" in source) {
    const inner = (source as { data?: unknown }).data;
    if (inner !== undefined && inner !== null) source = inner;
  }
  if (typeof source === "string") {
    const text = source.trim();
    if (text) return text;
  }
  if (source instanceof Error && source.message) return source.message;
  if (source && typeof source === "object") {
    const envelope = source as { error?: unknown; message?: unknown };
    if (envelope.error && typeof envelope.error === "object") {
      const message = (envelope.error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    if (typeof envelope.message === "string" && envelope.message.trim()) {
      return envelope.message;
    }
    if (typeof envelope.error === "string" && envelope.error.trim()) {
      return envelope.error;
    }
  }
  return "Request failed";
}

/** Backwards-compatible alias used by the auth screens. */
export const loginErrorMessage = apiErrorMessage;
