import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";

const tag = { type: "ItsmWork" as const, id: "approval-management" };
export const approvalManagementApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listApprovalResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/approval-engine/${resource}`, params }), providesTags: [tag] }),
  createApprovalResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/approval-engine/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateApprovalResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/approval-engine/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteApprovalResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/approval-engine/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListApprovalResourcesQuery, useCreateApprovalResourceMutation, useUpdateApprovalResourceMutation, useDeleteApprovalResourceMutation } = approvalManagementApi;
