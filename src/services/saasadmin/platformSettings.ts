import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord } from "./types";

/**
 * Platform-wide settings (branding, localization, security, retention) —
 * mounted at `/admin/platform-settings`.
 */
export const platformSettingsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listPlatformSettings: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/platform-settings" }),
      providesTags: ["PlatformSettings"],
    }),
    listPlatformSettingGroups: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/platform-settings/groups" }),
      providesTags: ["PlatformSettings"],
    }),
    getBrandingSettings: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/platform-settings/branding" }),
      providesTags: ["PlatformSettings"],
    }),
    updateBrandingSettings: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/platform-settings/branding",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
    getLocalizationSettings: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/platform-settings/localization" }),
      providesTags: ["PlatformSettings"],
    }),
    updateLocalizationSettings: build.mutation<
      ApiSuccess<ApiRecord>,
      ApiRecord
    >({
      query: (body) => ({
        url: "/admin/platform-settings/localization",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
    getSecuritySettings: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/platform-settings/security" }),
      providesTags: ["PlatformSettings"],
    }),
    updateSecuritySettings: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/platform-settings/security",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
    getRetentionSettings: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/platform-settings/retention" }),
      providesTags: ["PlatformSettings"],
    }),
    updateRetentionSettings: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/platform-settings/retention",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
    listFeatureFlags: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/platform-settings/feature-flags" }),
      providesTags: ["PlatformSettings"],
    }),
    updateFeatureFlag: build.mutation<
      ApiSuccess<ApiRecord>,
      { flagKey: string; body: ApiRecord }
    >({
      query: ({ flagKey, body }) => ({
        url: `/admin/platform-settings/feature-flags/${encodeURIComponent(flagKey)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
    getPlatformSetting: build.query<ApiSuccess<ApiRecord>, string>({
      query: (key) => ({
        url: `/admin/platform-settings/${encodeURIComponent(key)}`,
      }),
      providesTags: ["PlatformSettings"],
    }),
    updatePlatformSetting: build.mutation<
      ApiSuccess<ApiRecord>,
      { key: string; body: ApiRecord }
    >({
      query: ({ key, body }) => ({
        url: `/admin/platform-settings/${encodeURIComponent(key)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlatformSettings"],
    }),
  }),
});

export const {
  useListPlatformSettingsQuery,
  useListPlatformSettingGroupsQuery,
  useGetBrandingSettingsQuery,
  useUpdateBrandingSettingsMutation,
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetRetentionSettingsQuery,
  useUpdateRetentionSettingsMutation,
  useListFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
  useGetPlatformSettingQuery,
  useUpdatePlatformSettingMutation,
} = platformSettingsApi;
