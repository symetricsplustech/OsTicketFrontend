/**
 * Shared types for the SaaS Admin API (`/api/v1`).
 *
 * The response envelope (`ApiSuccess`, `ApiErrorBody`, `PaginationMeta`, …)
 * lives in `@services/http` and the auth types live in `@services/auth/types`;
 * both are re-exported here for backwards compatibility.
 */

export type {
  PaginationMeta,
  ApiSuccess,
  ApiErrorDetail,
  ApiErrorBody,
} from "@services/http";

export type {
  PublicProfile,
  AuthSessionPayload,
  LoginSuccess,
  LoginMfaChallenge,
  LoginResponse,
  MeResponse,
  SessionRecord,
  MessageResponse,
} from "@services/auth/types";

/** Loosely-typed record for resources whose full shape is not modelled yet. */
export type ApiRecord = Record<string, unknown>;

/** Common list/filter query used by paginated collection endpoints. */
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export interface Paginated<T> {
  items: T[];
  meta: import("@services/http").PaginationMeta;
}
