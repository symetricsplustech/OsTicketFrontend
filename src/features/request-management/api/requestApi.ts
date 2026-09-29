import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export type RequestResource = "reqs" | "ritms" | "tasks";

const requestTag = (resource: RequestResource) => ({ type: "ItsmWork" as const, id: `requests/${resource}` });

export const requestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRequestRecords: build.query<ApiListResponse, ListParams & { resource: RequestResource }>({
      query: ({ resource, ...params }) => ({ url: `/core/requests/${resource}`, params }),
      providesTags: (_result, _error, { resource }) => [requestTag(resource)],
    }),
    transitionRequestRecord: build.mutation<ApiRecordResponse, { resource: RequestResource; id: string; status: string; notes?: string }>({
      query: ({ resource, id, ...body }) => ({ url: `/core/requests/${resource}/${id}/transition`, method: "POST", body }),
      invalidatesTags: (_result, _error, { resource }) => [requestTag(resource)],
    }),
    cancelRequest: build.mutation<ApiRecordResponse, { id: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/core/requests/reqs/${id}/cancel`, method: "POST", body }),
      invalidatesTags: [requestTag("reqs")],
    }),
  }),
});

export const { useListRequestRecordsQuery, useTransitionRequestRecordMutation, useCancelRequestMutation } = requestApi;
