import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";
const tag = { type: "ItsmWork" as const, id: "on-call" };
export const onCallManagementApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listOnCallResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/oncall/${resource}`, params }), providesTags: [tag] }),
  createOnCallResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/oncall/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateOnCallResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/oncall/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteOnCallResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/oncall/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListOnCallResourcesQuery, useCreateOnCallResourceMutation, useUpdateOnCallResourceMutation, useDeleteOnCallResourceMutation } = onCallManagementApi;
