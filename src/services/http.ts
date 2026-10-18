import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
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
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return headers;
  },
});

export type AuthBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

/**
 * Attaches an auth handler: an expired/invalid session clears the token and
 * dispatches `logout()` so the route guard returns the user to sign-in.
 */
export const baseQueryWithAuth: AuthBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    TokenStore.clear();
    api.dispatch(logout());
  }
  return result;
};

/** Extracts a human-readable message from an API error envelope. */
export function apiErrorMessage(data: unknown): string {
  if (data && typeof data === "object") {
    const envelope = data as { error?: unknown; message?: unknown };
    if (envelope.error && typeof envelope.error === "object") {
      const message = (envelope.error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    if (typeof envelope.message === "string") return envelope.message;
    if (typeof envelope.error === "string") return envelope.error;
  }
  return "Request failed";
}

/** Backwards-compatible alias used by the auth screens. */
export const loginErrorMessage = apiErrorMessage;
