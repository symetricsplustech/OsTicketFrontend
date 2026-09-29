import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";
export const problemApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listProblems: build.query<ApiListResponse, ListParams>({ query: (params) => ({ url: "/core/problems", params }), providesTags: [{ type: "ItsmWork", id: "problems" }] }),
  createProblem: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/problems", method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "problems" }] }),
  updateProblem: build.mutation<ApiRecordResponse, { id: string; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/core/problems/${id}`, method: "PUT", body }), invalidatesTags: [{ type: "ItsmWork", id: "problems" }] }),
  transitionProblem: build.mutation<ApiRecordResponse, { id: string; status: string; notes?: string }>({ query: ({ id, ...body }) => ({ url: `/core/problems/${id}/transition`, method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "problems" }] }),
  commentOnProblem: build.mutation<ApiRecordResponse, { id: string; body: string }>({ query: ({ id, body }) => ({ url: `/core/problems/${id}/comment`, method: "POST", body: { body } }), invalidatesTags: [{ type: "ItsmWork", id: "problems" }] }),
}) });
export const { useListProblemsQuery, useCreateProblemMutation, useUpdateProblemMutation, useTransitionProblemMutation, useCommentOnProblemMutation } = problemApi;
