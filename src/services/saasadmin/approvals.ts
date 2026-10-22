import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Approval workflow policies and requests — mounted at `/admin/approvals`.
 */
export const approvalsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listApprovalPolicies: build.query<
      ApiSuccess<ApiRecord[]>,
      ListQuery | void
    >({
      query: (params) => ({
        url: "/admin/approvals/policies",
        params: params ?? undefined,
      }),
      providesTags: ["Approval"],
    }),
    createApprovalPolicy: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/approvals/policies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Approval"],
    }),
    getApprovalPolicy: build.query<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/approvals/policies/${encodeURIComponent(policyId)}`,
      }),
      providesTags: (_r, _e, policyId) => [{ type: "Approval", id: policyId }],
    }),
    updateApprovalPolicy: build.mutation<
      ApiSuccess<ApiRecord>,
      { policyId: string; body: ApiRecord }
    >({
      query: ({ policyId, body }) => ({
        url: `/admin/approvals/policies/${encodeURIComponent(policyId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { policyId }) => [
        "Approval",
        { type: "Approval", id: policyId },
      ],
    }),
    enableApprovalPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/approvals/policies/${encodeURIComponent(policyId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => [
        "Approval",
        { type: "Approval", id: policyId },
      ],
    }),
    disableApprovalPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/approvals/policies/${encodeURIComponent(policyId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => [
        "Approval",
        { type: "Approval", id: policyId },
      ],
    }),
    listApprovalRequests: build.query<
      ApiSuccess<ApiRecord[]>,
      ListQuery | void
    >({
      query: (params) => ({
        url: "/admin/approvals/requests",
        params: params ?? undefined,
      }),
      providesTags: ["Approval"],
    }),
    myPendingApprovals: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/approvals/my-pending",
        params: params ?? undefined,
      }),
      providesTags: ["Approval"],
    }),
    getApprovalRequest: build.query<ApiSuccess<ApiRecord>, string>({
      query: (requestId) => ({
        url: `/admin/approvals/requests/${encodeURIComponent(requestId)}`,
      }),
      providesTags: (_r, _e, requestId) => [
        { type: "Approval", id: requestId },
      ],
    }),
    approveRequest: build.mutation<
      ApiSuccess<ApiRecord>,
      { requestId: string; body?: ApiRecord }
    >({
      query: ({ requestId, body }) => ({
        url: `/admin/approvals/requests/${encodeURIComponent(requestId)}/approve`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { requestId }) => [
        "Approval",
        { type: "Approval", id: requestId },
      ],
    }),
    rejectRequest: build.mutation<
      ApiSuccess<ApiRecord>,
      { requestId: string; body: ApiRecord }
    >({
      query: ({ requestId, body }) => ({
        url: `/admin/approvals/requests/${encodeURIComponent(requestId)}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { requestId }) => [
        "Approval",
        { type: "Approval", id: requestId },
      ],
    }),
    cancelRequest: build.mutation<
      ApiSuccess<ApiRecord>,
      { requestId: string; body?: ApiRecord }
    >({
      query: ({ requestId, body }) => ({
        url: `/admin/approvals/requests/${encodeURIComponent(requestId)}/cancel`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { requestId }) => [
        "Approval",
        { type: "Approval", id: requestId },
      ],
    }),
  }),
});

export const {
  useListApprovalPoliciesQuery,
  useCreateApprovalPolicyMutation,
  useGetApprovalPolicyQuery,
  useUpdateApprovalPolicyMutation,
  useEnableApprovalPolicyMutation,
  useDisableApprovalPolicyMutation,
  useListApprovalRequestsQuery,
  useMyPendingApprovalsQuery,
  useGetApprovalRequestQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useCancelRequestMutation,
} = approvalsApi;
