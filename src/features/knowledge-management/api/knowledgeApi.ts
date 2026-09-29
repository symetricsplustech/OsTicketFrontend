import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export type KnowledgeResource = "bases" | "categories" | "articles" | "approvals";

const knowledgeTag = (resource: KnowledgeResource) => ({ type: "ItsmWork" as const, id: `knowledge/${resource}` });

export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listKnowledgeRecords: build.query<ApiListResponse, ListParams & { resource: KnowledgeResource }>({
      query: ({ resource, ...params }) => ({ url: `/core/knowledge/${resource}`, params }),
      providesTags: (_result, _error, { resource }) => [knowledgeTag(resource)],
    }),
    createKnowledgeRecord: build.mutation<ApiRecordResponse, { resource: KnowledgeResource; body: Record<string, unknown> }>({
      query: ({ resource, body }) => ({ url: `/core/knowledge/${resource}`, method: "POST", body }),
      invalidatesTags: (_result, _error, { resource }) => [knowledgeTag(resource)],
    }),
    updateKnowledgeRecord: build.mutation<ApiRecordResponse, { resource: KnowledgeResource; id: string; body: Record<string, unknown> }>({
      query: ({ resource, id, body }) => ({ url: `/core/knowledge/${resource}/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { resource }) => [knowledgeTag(resource)],
    }),
    deleteKnowledgeRecord: build.mutation<{ success?: boolean }, { resource: KnowledgeResource; id: string }>({
      query: ({ resource, id }) => ({ url: `/core/knowledge/${resource}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { resource }) => [knowledgeTag(resource)],
    }),
    transitionKnowledgeArticle: build.mutation<ApiRecordResponse, { id: string; status: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/core/knowledge/articles/${id}/transition`, method: "POST", body }),
      invalidatesTags: [knowledgeTag("articles")],
    }),
    addKnowledgeFeedback: build.mutation<ApiRecordResponse, { articleId: string; helpful: boolean; comment?: string }>({
      query: ({ articleId, ...body }) => ({ url: `/core/knowledge/articles/${articleId}/feedback`, method: "POST", body }),
      invalidatesTags: [knowledgeTag("articles")],
    }),
    listKnowledgeFeedback: build.query<ApiListResponse, { articleId: string }>({ query: ({ articleId }) => `/core/knowledge/articles/${articleId}/feedback`, providesTags: (_result, _error, { articleId }) => [{ type: "ItsmWork", id: `knowledge/feedback/${articleId}` }] }),
  }),
});

export const { useListKnowledgeRecordsQuery, useCreateKnowledgeRecordMutation, useUpdateKnowledgeRecordMutation, useDeleteKnowledgeRecordMutation, useTransitionKnowledgeArticleMutation, useAddKnowledgeFeedbackMutation, useListKnowledgeFeedbackQuery } = knowledgeApi;
