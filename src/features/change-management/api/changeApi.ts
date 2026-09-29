import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";
export const changeApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listChanges: build.query<ApiListResponse, ListParams>({ query: (params) => ({ url: "/core/changes", params }), providesTags: [{ type: "ItsmWork", id: "changes" }] }),
  createChange: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/changes", method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "changes" }] }),
  updateChange: build.mutation<ApiRecordResponse, { id: string; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/core/changes/${id}`, method: "PUT", body }), invalidatesTags: [{ type: "ItsmWork", id: "changes" }] }),
  transitionChange: build.mutation<ApiRecordResponse, { id: string; status: string; notes?: string }>({ query: ({ id, ...body }) => ({ url: `/core/changes/${id}/transition`, method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "changes" }] }),
}) });
export const { useListChangesQuery, useCreateChangeMutation, useUpdateChangeMutation, useTransitionChangeMutation } = changeApi;
