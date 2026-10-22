import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord } from "./types";

/**
 * CMDB configuration (CI types, relationships, asset categories, discovery) —
 * mounted at `/admin/cmdb-assets`.
 */
export const cmdbAssetsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listCiTypes: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/cmdb-assets/ci-types" }),
      providesTags: ["Cmdb"],
    }),
    createCiType: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/cmdb-assets/ci-types",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    getCiType: build.query<ApiSuccess<ApiRecord>, string>({
      query: (typeId) => ({
        url: `/admin/cmdb-assets/ci-types/${encodeURIComponent(typeId)}`,
      }),
      providesTags: (_r, _e, typeId) => [{ type: "Cmdb", id: typeId }],
    }),
    updateCiType: build.mutation<
      ApiSuccess<ApiRecord>,
      { typeId: string; body: ApiRecord }
    >({
      query: ({ typeId, body }) => ({
        url: `/admin/cmdb-assets/ci-types/${encodeURIComponent(typeId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { typeId }) => [
        "Cmdb",
        { type: "Cmdb", id: typeId },
      ],
    }),
    listRelationshipTypes: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/cmdb-assets/relationship-types" }),
      providesTags: ["Cmdb"],
    }),
    createRelationshipType: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/cmdb-assets/relationship-types",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    updateRelationshipType: build.mutation<
      ApiSuccess<ApiRecord>,
      { relationshipTypeId: string; body: ApiRecord }
    >({
      query: ({ relationshipTypeId, body }) => ({
        url: `/admin/cmdb-assets/relationship-types/${encodeURIComponent(relationshipTypeId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    listAssetCategories: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/cmdb-assets/asset-categories" }),
      providesTags: ["Cmdb"],
    }),
    createAssetCategory: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/cmdb-assets/asset-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    updateAssetCategory: build.mutation<
      ApiSuccess<ApiRecord>,
      { categoryId: string; body: ApiRecord }
    >({
      query: ({ categoryId, body }) => ({
        url: `/admin/cmdb-assets/asset-categories/${encodeURIComponent(categoryId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    listDiscoveryProfiles: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/cmdb-assets/discovery-profiles" }),
      providesTags: ["Cmdb"],
    }),
    createDiscoveryProfile: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/cmdb-assets/discovery-profiles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    updateDiscoveryProfile: build.mutation<
      ApiSuccess<ApiRecord>,
      { profileId: string; body: ApiRecord }
    >({
      query: ({ profileId, body }) => ({
        url: `/admin/cmdb-assets/discovery-profiles/${encodeURIComponent(profileId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cmdb"],
    }),
    getTenantCmdbConfiguration: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/cmdb-assets/tenants/${encodeURIComponent(tenantId)}/configuration`,
      }),
      providesTags: (_r, _e, tenantId) => [{ type: "Cmdb", id: tenantId }],
    }),
    setTenantCmdbConfiguration: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/cmdb-assets/tenants/${encodeURIComponent(tenantId)}/configuration`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        "Cmdb",
        { type: "Cmdb", id: tenantId },
      ],
    }),
  }),
});

export const {
  useListCiTypesQuery,
  useCreateCiTypeMutation,
  useGetCiTypeQuery,
  useUpdateCiTypeMutation,
  useListRelationshipTypesQuery,
  useCreateRelationshipTypeMutation,
  useUpdateRelationshipTypeMutation,
  useListAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useUpdateAssetCategoryMutation,
  useListDiscoveryProfilesQuery,
  useCreateDiscoveryProfileMutation,
  useUpdateDiscoveryProfileMutation,
  useGetTenantCmdbConfigurationQuery,
  useSetTenantCmdbConfigurationMutation,
} = cmdbAssetsApi;
