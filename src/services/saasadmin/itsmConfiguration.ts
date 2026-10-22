import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord } from "./types";

/**
 * ITSM configuration (modules, priorities, statuses, categories, numbering) —
 * mounted at `/admin/itsm-configuration`.
 */
export const itsmConfigurationApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listItsmModules: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/itsm-configuration/modules" }),
      providesTags: ["ItsmConfiguration"],
    }),
    getItsmModule: build.query<ApiSuccess<ApiRecord>, string>({
      query: (moduleKey) => ({
        url: `/admin/itsm-configuration/modules/${encodeURIComponent(moduleKey)}`,
      }),
      providesTags: (_r, _e, moduleKey) => [
        { type: "ItsmConfiguration", id: moduleKey },
      ],
    }),
    updateItsmModule: build.mutation<
      ApiSuccess<ApiRecord>,
      { moduleKey: string; body: ApiRecord }
    >({
      query: ({ moduleKey, body }) => ({
        url: `/admin/itsm-configuration/modules/${encodeURIComponent(moduleKey)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { moduleKey }) => [
        "ItsmConfiguration",
        { type: "ItsmConfiguration", id: moduleKey },
      ],
    }),
    listItsmPriorities: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/itsm-configuration/priorities" }),
      providesTags: ["ItsmConfiguration"],
    }),
    createItsmPriority: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/itsm-configuration/priorities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    updateItsmPriority: build.mutation<
      ApiSuccess<ApiRecord>,
      { priorityId: string; body: ApiRecord }
    >({
      query: ({ priorityId, body }) => ({
        url: `/admin/itsm-configuration/priorities/${encodeURIComponent(priorityId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    listItsmStatuses: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/itsm-configuration/statuses" }),
      providesTags: ["ItsmConfiguration"],
    }),
    createItsmStatus: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/itsm-configuration/statuses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    updateItsmStatus: build.mutation<
      ApiSuccess<ApiRecord>,
      { statusId: string; body: ApiRecord }
    >({
      query: ({ statusId, body }) => ({
        url: `/admin/itsm-configuration/statuses/${encodeURIComponent(statusId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    listItsmCategories: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/itsm-configuration/categories" }),
      providesTags: ["ItsmConfiguration"],
    }),
    createItsmCategory: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/itsm-configuration/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    updateItsmCategory: build.mutation<
      ApiSuccess<ApiRecord>,
      { categoryId: string; body: ApiRecord }
    >({
      query: ({ categoryId, body }) => ({
        url: `/admin/itsm-configuration/categories/${encodeURIComponent(categoryId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    listNumberingRules: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/itsm-configuration/numbering-rules" }),
      providesTags: ["ItsmConfiguration"],
    }),
    updateNumberingRule: build.mutation<
      ApiSuccess<ApiRecord>,
      { ruleId: string; body: ApiRecord }
    >({
      query: ({ ruleId, body }) => ({
        url: `/admin/itsm-configuration/numbering-rules/${encodeURIComponent(ruleId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ItsmConfiguration"],
    }),
    getTenantItsmConfiguration: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/itsm-configuration/tenants/${encodeURIComponent(tenantId)}/configuration`,
      }),
      providesTags: (_r, _e, tenantId) => [
        { type: "ItsmConfiguration", id: tenantId },
      ],
    }),
    setTenantItsmConfiguration: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/itsm-configuration/tenants/${encodeURIComponent(tenantId)}/configuration`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        "ItsmConfiguration",
        { type: "ItsmConfiguration", id: tenantId },
      ],
    }),
  }),
});

export const {
  useListItsmModulesQuery,
  useGetItsmModuleQuery,
  useUpdateItsmModuleMutation,
  useListItsmPrioritiesQuery,
  useCreateItsmPriorityMutation,
  useUpdateItsmPriorityMutation,
  useListItsmStatusesQuery,
  useCreateItsmStatusMutation,
  useUpdateItsmStatusMutation,
  useListItsmCategoriesQuery,
  useCreateItsmCategoryMutation,
  useUpdateItsmCategoryMutation,
  useListNumberingRulesQuery,
  useUpdateNumberingRuleMutation,
  useGetTenantItsmConfigurationQuery,
  useSetTenantItsmConfigurationMutation,
} = itsmConfigurationApi;
