import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

const tag = { type: "ItsmWork" as const, id: "universal-requests" };

export const universalRequestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUniversalRequests: build.query<ApiListResponse, ListParams>({ query: (params) => ({ url: "/core/universal-requests", params }), providesTags: [tag] }),
    createUniversalRequest: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/universal-requests", method: "POST", body }), invalidatesTags: [tag] }),
    updateUniversalRequest: build.mutation<ApiRecordResponse, { id: string; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/core/universal-requests/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
    transitionUniversalRequest: build.mutation<ApiRecordResponse, { id: string; status: string }>({ query: ({ id, status }) => ({ url: `/core/universal-requests/${id}/transition`, method: "POST", body: { status } }), invalidatesTags: [tag] }),
    deleteUniversalRequest: build.mutation<{ success: boolean }, { id: string }>({ query: ({ id }) => ({ url: `/core/universal-requests/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
  }),
});

export const { useListUniversalRequestsQuery, useCreateUniversalRequestMutation, useUpdateUniversalRequestMutation, useTransitionUniversalRequestMutation, useDeleteUniversalRequestMutation } = universalRequestApi;
