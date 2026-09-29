import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";

const tag = { type: "ItsmWork" as const, id: "configuration-management" };
export const configurationManagementApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listConfigurationResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/cmdb/${resource}`, params }), providesTags: [tag] }),
  createConfigurationResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/cmdb/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateConfigurationResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/cmdb/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteConfigurationResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/cmdb/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListConfigurationResourcesQuery, useCreateConfigurationResourceMutation, useUpdateConfigurationResourceMutation, useDeleteConfigurationResourceMutation } = configurationManagementApi;
