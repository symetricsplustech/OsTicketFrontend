import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";
const tag = { type: "ItsmWork" as const, id: "walk-up" };
export const walkUpExperienceApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listWalkUpResources: build.query<OperationalResponse, ResourceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/walkup/${resource}`, params }), providesTags: [tag] }),
  createWalkUpResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, body }) => ({ url: `/core/walkup/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateWalkUpResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/walkup/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteWalkUpResource: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ resource, id }) => ({ url: `/core/walkup/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListWalkUpResourcesQuery, useCreateWalkUpResourceMutation, useUpdateWalkUpResourceMutation, useDeleteWalkUpResourceMutation } = walkUpExperienceApi;
