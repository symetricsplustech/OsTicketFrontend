import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Tenant custom domains — mounted at
 * `/admin/tenants/:tenantId/domains`.
 *
 * Every endpoint is scoped by `tenantId`, so it is part of each argument.
 */
export const tenantDomainsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listAllTenantDomains: build.query<
      ApiSuccess<ApiRecord[]>,
      ListQuery | void
    >({
      query: (params) => ({
        url: "/admin/tenants/domains",
        params: params ?? undefined,
      }),
      providesTags: ["TenantDomain"],
    }),
    listTenantDomains: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (tenantId) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains`,
      }),
      providesTags: (_r, _e, tenantId) => [
        { type: "TenantDomain", id: tenantId },
      ],
    }),
    createTenantDomain: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        "TenantDomain",
        { type: "TenantDomain", id: tenantId },
      ],
    }),
    getTenantDomain: build.query<
      ApiSuccess<ApiRecord>,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}`,
      }),
      providesTags: ["TenantDomain"],
    }),
    verifyTenantDomain: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["TenantDomain"],
    }),
    activateTenantDomain: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["TenantDomain"],
    }),
    disableTenantDomain: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: ["TenantDomain"],
    }),
    deleteTenantDomain: build.mutation<
      null,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TenantDomain"],
    }),
    tenantDomainVerificationStatus: build.query<
      ApiSuccess<ApiRecord>,
      { tenantId: string; domainId: string }
    >({
      query: ({ tenantId, domainId }) => ({
        url: `/admin/tenants/${encodeURIComponent(tenantId)}/domains/${encodeURIComponent(domainId)}/verification-status`,
      }),
      providesTags: ["TenantDomain"],
    }),
  }),
});

export const {
  useListAllTenantDomainsQuery,
  useListTenantDomainsQuery,
  useCreateTenantDomainMutation,
  useGetTenantDomainQuery,
  useVerifyTenantDomainMutation,
  useActivateTenantDomainMutation,
  useDisableTenantDomainMutation,
  useDeleteTenantDomainMutation,
  useTenantDomainVerificationStatusQuery,
} = tenantDomainsApi;
