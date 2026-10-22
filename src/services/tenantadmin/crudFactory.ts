import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { ApiSuccess, AuthBaseQuery, PaginationMeta } from "@services/http";
import type { TenantAdminTag } from "./base";

/** Shared builder type for every tenant-admin endpoint module. */
export type TenantAdminBuild = EndpointBuilder<
  AuthBaseQuery,
  TenantAdminTag,
  "tenantadminApi"
>;

/** List query args — pagination + search plus module-specific filters. */
export interface ListArgs {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export type ListResponse<T> = ApiSuccess<T[]> & { meta?: PaginationMeta };
export type ItemResponse<T> = ApiSuccess<T>;
export type IdArg = string;
export type UpdateArgs = { id: string; body: Record<string, unknown> };
export type TransitionArgs = { id: string; body?: Record<string, unknown> };

/** Serializes list args into a query string, skipping empty values. */
export function qs(params: ListArgs | void | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

/** Builds a `${base}/${encodeURIComponent(id)}` resource URL. */
export function resourceUrl(base: string, id: string): string {
  return `${base}/${encodeURIComponent(id)}`;
}

export interface CrudOptions<Tag extends TenantAdminTag> {
  /** Base collection path, e.g. `/itsm/incidents`. */
  path: string;
  /** Tag + hook-name suffix, e.g. `Incident` → `listIncident`, `useListIncidentQuery`. */
  tag: Tag;
  /** When true, list `providesTags` uses the tag only (no per-id tags). */
  noDetailTag?: boolean;
}

/**
 * Standard tenant-scoped CRUD endpoints (list/get/create/update/delete).
 *
 * Endpoint keys are template literals over `Tag` (`listIncident`, `getIncident`,
 * …). The explicit mapped return type is required: without it TypeScript
 * widens the computed keys to `string` and `injectEndpoints` cannot generate
 * the matching `use…Query` hooks.
 */
export function crudEndpoints<T, Tag extends TenantAdminTag>(
  build: TenantAdminBuild,
  options: CrudOptions<Tag>,
) {
  const { path, tag } = options;
  const list = build.query<ListResponse<T>, ListArgs | void>({
    query: (args) => ({ url: `${path}${qs(args)}` }),
    providesTags: [tag],
  });
  const get = build.query<ItemResponse<T>, IdArg>({
    query: (id) => ({ url: resourceUrl(path, id) }),
    providesTags: (_result, _error, id) => [{ type: tag, id }],
  });
  const create = build.mutation<ItemResponse<T>, Record<string, unknown>>({
    query: (body) => ({ url: path, method: "POST", body }),
    invalidatesTags: [tag],
  });
  const update = build.mutation<ItemResponse<T>, UpdateArgs>({
    query: ({ id, body }) => ({
      url: resourceUrl(path, id),
      method: "PATCH",
      body,
    }),
    invalidatesTags: (_result, _error, args) => [
      { type: tag, id: args.id },
      tag,
    ],
  });
  const del = build.mutation<ApiSuccess<unknown>, IdArg>({
    query: (id) => ({ url: resourceUrl(path, id), method: "DELETE" }),
    invalidatesTags: [tag],
  });
  return {
    [`list${tag}`]: list,
    [`get${tag}`]: get,
    [`create${tag}`]: create,
    [`update${tag}`]: update,
    [`delete${tag}`]: del,
  } as {
    [K in Tag as `list${K}`]: typeof list;
  } & {
    [K in Tag as `get${K}`]: typeof get;
  } & {
    [K in Tag as `create${K}`]: typeof create;
  } & {
    [K in Tag as `update${K}`]: typeof update;
  } & {
    [K in Tag as `delete${K}`]: typeof del;
  };
}

/**
 * Single lifecycle/transition action (`POST <path>/:id/<actionPath>`), e.g.
 * assign / resolve / publish / enable. Name the endpoint key explicitly at the
 * call site so hooks stay precise.
 */
export function transitionEndpoint<T, Tag extends TenantAdminTag>(
  build: TenantAdminBuild,
  path: string,
  tag: Tag,
  actionPath: string,
) {
  return build.mutation<ItemResponse<T>, TransitionArgs>({
    query: ({ id, body }) => ({
      url: `${resourceUrl(path, id)}${actionPath}`,
      method: "POST",
      body: body ?? {},
    }),
    invalidatesTags: (_result, _error, args) => [
      { type: tag, id: args.id },
      tag,
    ],
  });
}

/** Sub-resource collection under a parent, e.g. `GET/POST <path>/:id/comments`. */
export function subListEndpoint<TItem, TParent extends TenantAdminTag>(
  build: TenantAdminBuild,
  path: string,
  tag: TParent,
) {
  return build.query<ListResponse<TItem>, { id: string } & ListArgs>({
    query: ({ id, ...args }) => ({
      url: `${resourceUrl(path, id)}${qs(args)}`,
    }),
    providesTags: (_result, _error, args) => [{ type: tag, id: args.id }],
  });
}

/** Create on a sub-resource collection. */
export function subCreateEndpoint<TItem, TParent extends TenantAdminTag>(
  build: TenantAdminBuild,
  path: string,
  tag: TParent,
) {
  return build.mutation<
    ItemResponse<TItem>,
    { id: string; body: Record<string, unknown> }
  >({
    query: ({ id, body }) => ({
      url: resourceUrl(path, id),
      method: "POST",
      body,
    }),
    invalidatesTags: (_result, _error, args) => [{ type: tag, id: args.id }],
  });
}

/** Flat sub-resource collection not nested under a parent id, e.g. `/itsm/catalog/categories`. */
export function nestedCrudEndpoints<T, Tag extends TenantAdminTag>(
  build: TenantAdminBuild,
  options: CrudOptions<Tag>,
) {
  return crudEndpoints<T, Tag>(build, options);
}
