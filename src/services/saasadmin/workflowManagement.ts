import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Workflow templates and runs — mounted at `/admin/workflow-management`.
 */
export const workflowManagementApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listWorkflowTemplates: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/workflow-management/templates",
        params: params ?? undefined,
      }),
      providesTags: ["Workflow"],
    }),
    createWorkflowTemplate: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/workflow-management/templates", method: "POST", body }),
      invalidatesTags: ["Workflow"],
    }),
    getWorkflowTemplate: build.query<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}`,
      }),
      providesTags: (_r, _e, templateId) => [{ type: "Workflow", id: templateId }],
    }),
    updateWorkflowTemplate: build.mutation<ApiSuccess<ApiRecord>, { templateId: string; body: ApiRecord }>({
      query: ({ templateId, body }) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { templateId }) => ["Workflow", { type: "Workflow", id: templateId }],
    }),
    validateWorkflowTemplate: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}/validate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, templateId) => [{ type: "Workflow", id: templateId }],
    }),
    publishWorkflowTemplate: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}/publish`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, templateId) => ["Workflow", { type: "Workflow", id: templateId }],
    }),
    retireWorkflowTemplate: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}/retire`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, templateId) => ["Workflow", { type: "Workflow", id: templateId }],
    }),
    getWorkflowTemplateVersions: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (templateId) => ({
        url: `/admin/workflow-management/templates/${encodeURIComponent(templateId)}/versions`,
      }),
      providesTags: (_r, _e, templateId) => [{ type: "Workflow", id: templateId }],
    }),
    listWorkflowRuns: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/workflow-management/runs", params: params ?? undefined }),
      providesTags: ["Workflow"],
    }),
    getWorkflowRun: build.query<ApiSuccess<ApiRecord>, string>({
      query: (runId) => ({ url: `/admin/workflow-management/runs/${encodeURIComponent(runId)}` }),
      providesTags: (_r, _e, runId) => [{ type: "Workflow", id: runId }],
    }),
    cancelWorkflowRun: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (runId) => ({
        url: `/admin/workflow-management/runs/${encodeURIComponent(runId)}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, runId) => ["Workflow", { type: "Workflow", id: runId }],
    }),
    getTenantWorkflowAssignments: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/workflow-management/tenants/${encodeURIComponent(tenantId)}/assignments`,
      }),
      providesTags: (_r, _e, tenantId) => [{ type: "Workflow", id: tenantId }],
    }),
    setTenantWorkflowAssignments: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/workflow-management/tenants/${encodeURIComponent(tenantId)}/assignments`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Workflow", "Tenant"],
    }),
  }),
});

export const {
  useListWorkflowTemplatesQuery,
  useCreateWorkflowTemplateMutation,
  useGetWorkflowTemplateQuery,
  useUpdateWorkflowTemplateMutation,
  useValidateWorkflowTemplateMutation,
  usePublishWorkflowTemplateMutation,
  useRetireWorkflowTemplateMutation,
  useGetWorkflowTemplateVersionsQuery,
  useListWorkflowRunsQuery,
  useGetWorkflowRunQuery,
  useCancelWorkflowRunMutation,
  useGetTenantWorkflowAssignmentsQuery,
  useSetTenantWorkflowAssignmentsMutation,
} = workflowManagementApi;
