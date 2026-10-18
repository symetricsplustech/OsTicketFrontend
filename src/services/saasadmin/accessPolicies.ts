import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Access control policies — mounted at `/admin/access-policies`.
 */
export const accessPoliciesApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listAccessPolicies: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/access-policies", params: params ?? undefined }),
      providesTags: ["AccessPolicy"],
    }),
    createAccessPolicy: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/access-policies", method: "POST", body }),
      invalidatesTags: ["AccessPolicy"],
    }),
    getAccessPolicy: build.query<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({ url: `/admin/access-policies/${encodeURIComponent(policyId)}` }),
      providesTags: (_r, _e, policyId) => [{ type: "AccessPolicy", id: policyId }],
    }),
    updateAccessPolicy: build.mutation<ApiSuccess<ApiRecord>, { policyId: string; body: ApiRecord }>({
      query: ({ policyId, body }) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { policyId }) => ["AccessPolicy", { type: "AccessPolicy", id: policyId }],
    }),
    enableAccessPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => ["AccessPolicy", { type: "AccessPolicy", id: policyId }],
    }),
    disableAccessPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => ["AccessPolicy", { type: "AccessPolicy", id: policyId }],
    }),
    getAccessPolicyAssignments: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (policyId) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}/assignments`,
      }),
      providesTags: (_r, _e, policyId) => [{ type: "AccessPolicy", id: policyId }],
    }),
    addAccessPolicyAssignment: build.mutation<
      ApiSuccess<ApiRecord>,
      { policyId: string; body: ApiRecord }
    >({
      query: ({ policyId, body }) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}/assignments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { policyId }) => [{ type: "AccessPolicy", id: policyId }],
    }),
    removeAccessPolicyAssignment: build.mutation<
      null,
      { policyId: string; assignmentId: string }
    >({
      query: ({ policyId, assignmentId }) => ({
        url: `/admin/access-policies/${encodeURIComponent(policyId)}/assignments/${encodeURIComponent(assignmentId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { policyId }) => [{ type: "AccessPolicy", id: policyId }],
    }),
  }),
});

export const {
  useListAccessPoliciesQuery,
  useCreateAccessPolicyMutation,
  useGetAccessPolicyQuery,
  useUpdateAccessPolicyMutation,
  useEnableAccessPolicyMutation,
  useDisableAccessPolicyMutation,
  useGetAccessPolicyAssignmentsQuery,
  useAddAccessPolicyAssignmentMutation,
  useRemoveAccessPolicyAssignmentMutation,
} = accessPoliciesApi;
