import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Service catalog: services, categories and templates — mounted at
 * `/admin/service-management`.
 */
export const serviceManagementApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listServices: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/service-management/services",
        params: params ?? undefined,
      }),
      providesTags: ["Service"],
    }),
    createService: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/service-management/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Service"],
    }),
    getService: build.query<ApiSuccess<ApiRecord>, string>({
      query: (serviceId) => ({
        url: `/admin/service-management/services/${encodeURIComponent(serviceId)}`,
      }),
      providesTags: (_r, _e, serviceId) => [{ type: "Service", id: serviceId }],
    }),
    updateService: build.mutation<
      ApiSuccess<ApiRecord>,
      { serviceId: string; body: ApiRecord }
    >({
      query: ({ serviceId, body }) => ({
        url: `/admin/service-management/services/${encodeURIComponent(serviceId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { serviceId }) => [
        "Service",
        { type: "Service", id: serviceId },
      ],
    }),
    enableService: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (serviceId) => ({
        url: `/admin/service-management/services/${encodeURIComponent(serviceId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, serviceId) => [
        "Service",
        { type: "Service", id: serviceId },
      ],
    }),
    disableService: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (serviceId) => ({
        url: `/admin/service-management/services/${encodeURIComponent(serviceId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, serviceId) => [
        "Service",
        { type: "Service", id: serviceId },
      ],
    }),
    listServiceCategories: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/service-management/categories" }),
      providesTags: ["Service"],
    }),
    createServiceCategory: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/service-management/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Service"],
    }),
    updateServiceCategory: build.mutation<
      ApiSuccess<ApiRecord>,
      { categoryId: string; body: ApiRecord }
    >({
      query: ({ categoryId, body }) => ({
        url: `/admin/service-management/categories/${encodeURIComponent(categoryId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Service"],
    }),
    deleteServiceCategory: build.mutation<null, string>({
      query: (categoryId) => ({
        url: `/admin/service-management/categories/${encodeURIComponent(categoryId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
    listServiceTemplates: build.query<
      ApiSuccess<ApiRecord[]>,
      ListQuery | void
    >({
      query: (params) => ({
        url: "/admin/service-management/templates",
        params: params ?? undefined,
      }),
      providesTags: ["Service"],
    }),
    createServiceTemplate: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/service-management/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Service"],
    }),
    getServiceTemplate: build.query<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/service-management/templates/${encodeURIComponent(templateId)}`,
      }),
      providesTags: (_r, _e, templateId) => [
        { type: "Service", id: templateId },
      ],
    }),
    updateServiceTemplate: build.mutation<
      ApiSuccess<ApiRecord>,
      { templateId: string; body: ApiRecord }
    >({
      query: ({ templateId, body }) => ({
        url: `/admin/service-management/templates/${encodeURIComponent(templateId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { templateId }) => [
        "Service",
        { type: "Service", id: templateId },
      ],
    }),
    getServiceTemplateVersions: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (templateId) => ({
        url: `/admin/service-management/templates/${encodeURIComponent(templateId)}/versions`,
      }),
      providesTags: (_r, _e, templateId) => [
        { type: "Service", id: templateId },
      ],
    }),
    publishServiceTemplate: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/service-management/templates/${encodeURIComponent(templateId)}/publish`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, templateId) => [
        { type: "Service", id: templateId },
      ],
    }),
    setTenantServices: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/service-management/tenants/${encodeURIComponent(tenantId)}/services`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Service", "Tenant"],
    }),
  }),
});

export const {
  useListServicesQuery,
  useCreateServiceMutation,
  useGetServiceQuery,
  useUpdateServiceMutation,
  useEnableServiceMutation,
  useDisableServiceMutation,
  useListServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useListServiceTemplatesQuery,
  useCreateServiceTemplateMutation,
  useGetServiceTemplateQuery,
  useUpdateServiceTemplateMutation,
  useGetServiceTemplateVersionsQuery,
  usePublishServiceTemplateMutation,
  useSetTenantServicesMutation,
} = serviceManagementApi;
