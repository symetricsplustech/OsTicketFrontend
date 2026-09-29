import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";

const tag = { type: "ItsmWork" as const, id: "assignment-routing" };
export const assignmentRoutingApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listAssignmentResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/assignments/${resource}`, params }), providesTags: [tag] }),
  createAssignmentResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/assignments/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateAssignmentResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/assignments/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteAssignmentResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/assignments/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListAssignmentResourcesQuery, useCreateAssignmentResourceMutation, useUpdateAssignmentResourceMutation, useDeleteAssignmentResourceMutation } = assignmentRoutingApi;
