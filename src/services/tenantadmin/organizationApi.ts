import { tenantadminApi } from "./base";
import type { ApiSuccess } from "@services/http";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  timezone: string | null;
  locale: string | null;
  industry: string | null;
  website: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  emailHeaderHtml: string | null;
  emailFooterHtml: string | null;
  supportUrl: string | null;
  metadata: Record<string, unknown> | null;
}

export interface OrganizationLocalization {
  defaultLocale: string | null;
  supportedLocales: string[];
  defaultTimezone: string | null;
  dateFormat: string | null;
  timeFormat: string | null;
  firstDayOfWeek: number | null;
  currency: string | null;
  numberFormat: string | null;
  metadata: Record<string, unknown> | null;
}

export interface OrganizationBusinessHours {
  timezone: string | null;
  schedule: Record<string, unknown> | null;
  holidays: unknown[];
  metadata: Record<string, unknown> | null;
}

export interface OrganizationStructureNode {
  id: string;
  label: string;
  kind: string;
  parentId: string | null;
  managerId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface OrganizationStructure {
  reportingMode: string | null;
  rootNodeId: string | null;
  nodes: OrganizationStructureNode[];
  metadata: Record<string, unknown> | null;
}

export const organizationApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganization: build.query<ApiSuccess<Organization>, void>({
      query: () => ({ url: "/tenant-admin/organization" }),
      providesTags: ["Organization"],
    }),
    updateOrganization: build.mutation<
      ApiSuccess<Organization>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/organization",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Organization"],
    }),
    getOrganizationBranding: build.query<
      ApiSuccess<OrganizationBranding>,
      void
    >({
      query: () => ({ url: "/tenant-admin/organization/branding" }),
      providesTags: ["OrganizationBranding"],
    }),
    updateOrganizationBranding: build.mutation<
      ApiSuccess<OrganizationBranding>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/organization/branding",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["OrganizationBranding"],
    }),
    getOrganizationLocalization: build.query<
      ApiSuccess<OrganizationLocalization>,
      void
    >({
      query: () => ({ url: "/tenant-admin/organization/localization" }),
      providesTags: ["OrganizationLocalization"],
    }),
    updateOrganizationLocalization: build.mutation<
      ApiSuccess<OrganizationLocalization>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/organization/localization",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["OrganizationLocalization"],
    }),
    getOrganizationBusinessHours: build.query<
      ApiSuccess<OrganizationBusinessHours>,
      void
    >({
      query: () => ({ url: "/tenant-admin/organization/business-hours" }),
      providesTags: ["OrganizationBusinessHours"],
    }),
    updateOrganizationBusinessHours: build.mutation<
      ApiSuccess<OrganizationBusinessHours>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/organization/business-hours",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["OrganizationBusinessHours"],
    }),
    getOrganizationStructure: build.query<
      ApiSuccess<OrganizationStructure>,
      void
    >({
      query: () => ({ url: "/tenant-admin/organization-structure" }),
      providesTags: ["OrganizationStructure"],
    }),
    updateOrganizationStructure: build.mutation<
      ApiSuccess<OrganizationStructure>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/organization-structure",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["OrganizationStructure"],
    }),
  }),
});

export const {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useGetOrganizationBrandingQuery,
  useUpdateOrganizationBrandingMutation,
  useGetOrganizationLocalizationQuery,
  useUpdateOrganizationLocalizationMutation,
  useGetOrganizationBusinessHoursQuery,
  useUpdateOrganizationBusinessHoursMutation,
  useGetOrganizationStructureQuery,
  useUpdateOrganizationStructureMutation,
} = organizationApi;
