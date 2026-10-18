import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Tenant lifecycle management — mounted at `/admin/tenants`.
 */
export const tenantsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listTenants: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/tenants", params: params ?? undefined }),
      providesTags: ["Tenant"],
    }),
    createTenant: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/tenants", method: "POST", body }),
      invalidatesTags: ["Tenant"],
    }),
    getTenant: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({ url: `/admin/tenants/${encodeURIComponent(tenantId)}` }),
      providesTags: (_r, _e, tenantId) => [{ type: "Tenant", id: tenantId }],
    }),
    updateTenant: build.mutation<ApiSuccess<ApiRecord>, { tenantId: string; body: ApiRecord }>({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => ["Tenant", { type: "Tenant", id: tenantId }],
    }),
    activateTenant: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/activate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, tenantId) => ["Tenant", { type: "Tenant", id: tenantId }],
    }),
    suspendTenant: build.mutation<ApiSuccess<ApiRecord>, { tenantId: string; body?: ApiRecord }>({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/suspend`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { tenantId }) => ["Tenant", { type: "Tenant", id: tenantId }],
    }),
    reactivateTenant: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/reactivate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, tenantId) => ["Tenant", { type: "Tenant", id: tenantId }],
    }),
    archiveTenant: build.mutation<ApiSuccess<ApiRecord>, { tenantId: string; body?: ApiRecord }>({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/archive`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { tenantId }) => ["Tenant", { type: "Tenant", id: tenantId }],
    }),
    tenantOverview: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({ url: `/admin/tenants/${encodeURIComponent(tenantId)}/overview` }),
      providesTags: (_r, _e, tenantId) => [{ type: "Tenant", id: tenantId }],
    }),
    tenantUsers: build.query<ApiSuccess<ApiRecord[]>, { tenantId: string } & ListQuery>({
      query: ({ tenantId, ...params }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/users`,
        params,
      }),
      providesTags: (_r, _e, { tenantId }) => [{ type: "Tenant", id: tenantId }],
    }),
    tenantActivity: build.query<ApiSuccess<ApiRecord[]>, { tenantId: string } & ListQuery>({
      query: ({ tenantId, ...params }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/activity`,
        params,
      }),
      providesTags: (_r, _e, { tenantId }) => [{ type: "Tenant", id: tenantId }],
    }),
    tenantHealth: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({ url: `/admin/tenants/${encodeURIComponent(tenantId)}/health` }),
      providesTags: (_r, _e, tenantId) => [{ type: "Tenant", id: tenantId }],
    }),
    provisionTenant: build.mutation<ApiSuccess<ApiRecord>, { tenantId: string; body?: ApiRecord }>({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/provision`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [{ type: "Tenant", id: tenantId }],
    }),
    tenantProvisioningStatus: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/provisioning-status`,
      }),
      providesTags: (_r, _e, tenantId) => [{ type: "Tenant", id: tenantId }],
    }),
    createTenantImpersonationSession: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/impersonation-sessions`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useListTenantsQuery,
  useCreateTenantMutation,
  useGetTenantQuery,
  useUpdateTenantMutation,
  useActivateTenantMutation,
  useSuspendTenantMutation,
  useReactivateTenantMutation,
  useArchiveTenantMutation,
  useTenantOverviewQuery,
  useTenantUsersQuery,
  useTenantActivityQuery,
  useTenantHealthQuery,
  useProvisionTenantMutation,
  useTenantProvisioningStatusQuery,
  useCreateTenantImpersonationSessionMutation,
} = tenantsApi;
