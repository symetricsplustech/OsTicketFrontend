import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";
const tag = { type: "ItsmWork" as const, id: "releases" };
export const releaseManagementApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listReleaseResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/release/${resource}`, params }), providesTags: [tag] }),
  createReleaseResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/release/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateReleaseResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/release/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteReleaseResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/release/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListReleaseResourcesQuery, useCreateReleaseResourceMutation, useUpdateReleaseResourceMutation, useDeleteReleaseResourceMutation } = releaseManagementApi;
