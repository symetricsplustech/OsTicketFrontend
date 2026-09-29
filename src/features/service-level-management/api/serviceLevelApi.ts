import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export type ServiceLevelResource = "plans" | "olas" | "schedules" | "calendars" | "events";

const serviceLevelTag = (resource: ServiceLevelResource) => ({ type: "ItsmWork" as const, id: `slm/${resource}` });

export const serviceLevelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listServiceLevelRecords: build.query<ApiListResponse, ListParams & { resource: ServiceLevelResource }>({
      query: ({ resource, ...params }) => ({ url: `/core/slm/${resource}`, params }),
      providesTags: (_result, _error, { resource }) => [serviceLevelTag(resource)],
    }),
    createServiceLevelRecord: build.mutation<ApiRecordResponse, { resource: ServiceLevelResource; body: Record<string, unknown> }>({
      query: ({ resource, body }) => ({ url: `/core/slm/${resource}`, method: "POST", body }),
      invalidatesTags: (_result, _error, { resource }) => [serviceLevelTag(resource)],
    }),
    updateServiceLevelRecord: build.mutation<ApiRecordResponse, { resource: ServiceLevelResource; id: string; body: Record<string, unknown> }>({
      query: ({ resource, id, body }) => ({ url: `/core/slm/${resource}/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { resource }) => [serviceLevelTag(resource)],
    }),
    deleteServiceLevelRecord: build.mutation<{ success?: boolean }, { resource: ServiceLevelResource; id: string }>({
      query: ({ resource, id }) => ({ url: `/core/slm/${resource}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { resource }) => [serviceLevelTag(resource)],
    }),
  }),
});

export const { useListServiceLevelRecordsQuery, useCreateServiceLevelRecordMutation, useUpdateServiceLevelRecordMutation, useDeleteServiceLevelRecordMutation } = serviceLevelApi;
