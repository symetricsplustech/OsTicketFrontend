import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export const instanceApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  getInstanceHome: build.query<ApiListResponse, void>({ query: () => ({ url: "/core/instance", params }), providesTags: [{ type: "Phase00", id: "instanceHome" }] }),
  getInstanceProfile: build.query<ApiRecordResponse, string>({ query: (id) => ({ url: `/core/instance/${id}`, providesTags: [{ type: "Phase00", id: "instanceProfile" }] }),
  getInstanceSettings: build.query<ApiRecordResponse, void>({ query: () => ({ url: "/core/instance/settings" }), providesTags: [{ type: "Phase00", id: "instanceSettings" }] ),
  updateInstanceSettings: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/instance/settings", method: "PUT", body }), invalidatesTags: [{ type: "Phase00", id: "instanceSettings" }] ),
  getBranding: build.query<ApiRecordResponse, void>({ query: () => ({ url: "/core/instance/branding" }), providesTags: [{ type: "Phase00", id: "branding" }] }),
  updateBranding: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/instance/branding", method: "PUT", body }), invalidatesTags: [{ type: "Phase00", id: "branding" }] }),
  getLocaleTimezone: build.query<ApiRecordResponse, void>({ query: () => ({ url: "/core/instance/locale" }), providesTags: [{ type: "Phase00", id: "localeTimezone" }] }),
  updateLocaleTimezone: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/instance/locale", method: "PUT", body }), invalidatesTags: [{ type: "Phase00", id: "localeTimezone" }] }),
  getFeatureEntitlements: build.query<ApiListResponse, void>({ query: () => ({ url: "/core/feature-entitlements" }), providesTags: [{ type: "Phase00", id: "featureEntitlements" }] }),
  getModuleActivation: build.query<ApiRecordResponse, void>({ query: () => ({ url: "/core/module-activation" }), providesTags: [{ type: "Phase00", id: "moduleActivation" }] ),
  updateModuleActivation: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/module-activation", method: "PUT", body }), invalidatesTags: [{ type: "Phase00", id: "moduleActivation" }] }),
  getInstanceHealth: build.query<ApiRecordResponse, void>({ query: () => ({ url: "/core/instance/health" }), providesTags: [{ type: "Phase00", id: "instanceHealth" }] }),
  getInstanceAudit: build.query<ApiListResponse, void>({ query: () => ({ url: "/core/instance/audit" }), providesTags: [{ type: "Phase00", id: "instanceAudit" }] ),
}) });
export const {
  useGetInstanceHomeQuery,
  useGetInstanceProfileQuery,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingsMutation,
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useGetLocaleTimezoneQuery,
  useUpdateLocaleTimezoneMutation,
  useGetFeatureEntitlementsQuery,
  useGetModuleActivationQuery,
  useUpdateModuleActivationMutation,
  useGetInstanceHealthQuery,
  useGetInstanceAuditQuery,
} = instanceApi;