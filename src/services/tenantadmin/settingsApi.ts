import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess } from "@services/http";

export interface TenantSetting {
  key: string;
  value: unknown;
  description: string | null;
  updatedAt: string | null;
}

export interface CustomField {
  id: string;
  name: string;
  key: string;
  resourceType: string;
  fieldType: string;
  options: unknown[] | null;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalConfig {
  [key: string]: unknown;
}

export const CUSTOM_FIELDS_PATH = "/itsm/settings/custom-fields";

export const settingsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listSettings: build.query<ApiSuccess<TenantSetting[]>, ListArgs | void>({
      query: (args) => ({ url: `/itsm/settings${qs(args ?? {})}` }),
      providesTags: ["Setting"],
    }),
    getSetting: build.query<ApiSuccess<TenantSetting>, string>({
      query: (key) => ({
        url: resourceUrl("/itsm/settings", encodeURIComponent(key)),
      }),
      providesTags: ["Setting"],
    }),
    putSetting: build.mutation<
      ApiSuccess<TenantSetting>,
      { key: string; value: unknown }
    >({
      query: ({ key, value }) => ({
        url: resourceUrl("/itsm/settings", encodeURIComponent(key)),
        method: "PUT",
        body: { value },
      }),
      invalidatesTags: ["Setting"],
    }),
    deleteSetting: build.mutation<ApiSuccess<unknown>, string>({
      query: (key) => ({
        url: resourceUrl("/itsm/settings", encodeURIComponent(key)),
        method: "DELETE",
      }),
      invalidatesTags: ["Setting"],
    }),
    ...crudEndpoints<CustomField, "CustomField">(build, {
      path: CUSTOM_FIELDS_PATH,
      tag: "CustomField",
    }),
  }),
});

export const {
  useListSettingsQuery,
  useGetSettingQuery,
  usePutSettingMutation,
  useDeleteSettingMutation,
  useListCustomFieldQuery,
  useGetCustomFieldQuery,
  useCreateCustomFieldMutation,
  useUpdateCustomFieldMutation,
  useDeleteCustomFieldMutation,
} = settingsApi;

export const portalApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    getPortalConfig: build.query<ApiSuccess<PortalConfig>, void>({
      query: () => ({ url: "/itsm/portal/config" }),
      providesTags: ["PortalConfig"],
    }),
    updatePortalConfig: build.mutation<
      ApiSuccess<PortalConfig>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/itsm/portal/config", method: "PUT", body }),
      invalidatesTags: ["PortalConfig"],
    }),
    listPortalForms: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => ({ url: "/itsm/portal/forms" }),
      providesTags: ["PortalConfig"],
    }),
    putPortalForm: build.mutation<
      ApiSuccess<unknown>,
      { formKey: string; body: Record<string, unknown> }
    >({
      query: ({ formKey, body }) => ({
        url: `/itsm/portal/forms/${encodeURIComponent(formKey)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PortalConfig"],
    }),
    deletePortalForm: build.mutation<ApiSuccess<unknown>, string>({
      query: (formKey) => ({
        url: `/itsm/portal/forms/${encodeURIComponent(formKey)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PortalConfig"],
    }),
  }),
});

export const {
  useGetPortalConfigQuery,
  useUpdatePortalConfigMutation,
  useListPortalFormsQuery,
  usePutPortalFormMutation,
  useDeletePortalFormMutation,
} = portalApi;
