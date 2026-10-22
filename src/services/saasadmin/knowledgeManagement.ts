import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord } from "./types";

/**
 * Knowledge management policy (policies, categories, templates, review rules) —
 * mounted at `/admin/knowledge-management`.
 */
export const knowledgeManagementApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listKnowledgePolicies: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/knowledge-management/policies" }),
      providesTags: ["Knowledge"],
    }),
    createKnowledgePolicy: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/knowledge-management/policies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    updateKnowledgePolicy: build.mutation<
      ApiSuccess<ApiRecord>,
      { policyId: string; body: ApiRecord }
    >({
      query: ({ policyId, body }) => ({
        url: `/admin/knowledge-management/policies/${encodeURIComponent(policyId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    listKnowledgeCategories: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/knowledge-management/categories" }),
      providesTags: ["Knowledge"],
    }),
    createKnowledgeCategory: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/knowledge-management/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    updateKnowledgeCategory: build.mutation<
      ApiSuccess<ApiRecord>,
      { categoryId: string; body: ApiRecord }
    >({
      query: ({ categoryId, body }) => ({
        url: `/admin/knowledge-management/categories/${encodeURIComponent(categoryId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    listKnowledgeTemplates: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/knowledge-management/templates" }),
      providesTags: ["Knowledge"],
    }),
    createKnowledgeTemplate: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/knowledge-management/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    updateKnowledgeTemplate: build.mutation<
      ApiSuccess<ApiRecord>,
      { templateId: string; body: ApiRecord }
    >({
      query: ({ templateId, body }) => ({
        url: `/admin/knowledge-management/templates/${encodeURIComponent(templateId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    listKnowledgeReviewRules: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/knowledge-management/review-rules" }),
      providesTags: ["Knowledge"],
    }),
    createKnowledgeReviewRule: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>(
      {
        query: (body) => ({
          url: "/admin/knowledge-management/review-rules",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Knowledge"],
      },
    ),
    updateKnowledgeReviewRule: build.mutation<
      ApiSuccess<ApiRecord>,
      { ruleId: string; body: ApiRecord }
    >({
      query: ({ ruleId, body }) => ({
        url: `/admin/knowledge-management/review-rules/${encodeURIComponent(ruleId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Knowledge"],
    }),
    getTenantKnowledgeSettings: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/knowledge-management/tenants/${encodeURIComponent(tenantId)}/settings`,
      }),
      providesTags: (_r, _e, tenantId) => [{ type: "Knowledge", id: tenantId }],
    }),
    setTenantKnowledgeSettings: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/knowledge-management/tenants/${encodeURIComponent(tenantId)}/settings`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        "Knowledge",
        { type: "Knowledge", id: tenantId },
      ],
    }),
  }),
});

export const {
  useListKnowledgePoliciesQuery,
  useCreateKnowledgePolicyMutation,
  useUpdateKnowledgePolicyMutation,
  useListKnowledgeCategoriesQuery,
  useCreateKnowledgeCategoryMutation,
  useUpdateKnowledgeCategoryMutation,
  useListKnowledgeTemplatesQuery,
  useCreateKnowledgeTemplateMutation,
  useUpdateKnowledgeTemplateMutation,
  useListKnowledgeReviewRulesQuery,
  useCreateKnowledgeReviewRuleMutation,
  useUpdateKnowledgeReviewRuleMutation,
  useGetTenantKnowledgeSettingsQuery,
  useSetTenantKnowledgeSettingsMutation,
} = knowledgeManagementApi;
