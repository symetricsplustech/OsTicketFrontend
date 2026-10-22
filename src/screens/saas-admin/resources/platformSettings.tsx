import { Settings, Globe } from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type {
  ResourceListConfig,
  ConfigPanelConfig,
  ResourceRow,
} from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListPlatformSettingsQuery,
  useGetBrandingSettingsQuery,
  useUpdateBrandingSettingsMutation,
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
  useGetMaintenanceQuery,
  useUpdateMaintenanceMutation,
  useListAllTenantDomainsQuery,
  useCreateTenantDomainMutation,
} from "@services/saasadmin";

const SECTION = "Platform Settings";

export const PLATFORM_SETTINGS_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/platform-settings/general",
    title: "General Settings",
    description: "Platform setting keys grouped by domain.",
    sectionLabel: SECTION,
    rowId: "key",
    source: {
      kind: "api",
      useList: asQueryHook(useListPlatformSettingsQuery),
      extractRows: (payload) => extractArray(payload),
    },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("group", "Group"),
      textCol("type", "Type"),
      textCol("description", "Description"),
      textCol("value", "Value", { truncate: 40 }),
    ],
    searchable: (r) => `${r.key} ${r.group} ${r.description}`,
    stats: [
      {
        key: "total",
        label: "Settings",
        compute: (rows) => rows.length,
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/platform-settings/domains",
    title: "Custom Domains",
    description: "Custom domains provisioned for tenants.",
    sectionLabel: SECTION,
    rowId: "domain",
    source: { kind: "api", useList: asQueryHook(useListAllTenantDomainsQuery) },
    columns: [
      {
        key: "domain",
        header: "Domain",
        render: (r) => (
          <span className="text-sm font-medium text-slate-800">
            {String(r.domain ?? "—")}
          </span>
        ),
      },
      {
        key: "tenant.name",
        header: "Tenant",
        render: (r) => (
          <span className="text-sm text-slate-700">
            {String((r.tenant as { name?: string } | undefined)?.name ?? "—")}
          </span>
        ),
      },
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("type", "Type"),
      dateCol("verifiedAt", "Verified"),
      dateCol("activatedAt", "Activated"),
    ],
    searchable: (r) =>
      `${r.domain} ${(r.tenant as { name?: string } | undefined)?.name ?? ""}`,
    create: {
      title: "Add Custom Domain",
      fields: [
        {
          key: "domain",
          label: "Domain",
          type: "text",
          required: true,
          placeholder: "portal.example.com",
          help: "Fully-qualified domain name to register.",
        },
        {
          key: "tenantId",
          label: "Tenant",
          type: "select",
          optionsSource: "tenants",
          required: true,
          help: "Domain is registered for the selected tenant.",
        },
      ],
      useCreate: asMutationHook(useCreateTenantDomainMutation),
      buildBody: (values) => ({
        tenantId: String(values.tenantId ?? ""),
        body: { domain: String(values.domain ?? "") },
      }),
    },
    stats: [
      {
        key: "total",
        label: "Domains",
        compute: (rows) => rows.length,
        icon: <Globe className="h-5 w-5" />,
      },
    ],
  },
];

function extractArray(payload: unknown): ResourceRow[] {
  if (Array.isArray(payload)) return payload as ResourceRow[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: ResourceRow[] }).data;
  }
  return [];
}

export const PLATFORM_SETTINGS_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/platform-settings/branding",
    title: "Branding & White Label",
    description: "Platform name, logo and color branding.",
    sectionLabel: SECTION,
    fields: [
      { key: "platformName", label: "Platform Name", type: "text" },
      { key: "logoUrl", label: "Logo URL", type: "text" },
      { key: "faviconUrl", label: "Favicon URL", type: "text" },
      { key: "primaryColor", label: "Primary Color", type: "text" },
    ],
    useGet: asQueryHook(useGetBrandingSettingsQuery),
    useUpdate: asMutationHook(useUpdateBrandingSettingsMutation),
    getValues: (payload) => {
      const value = (payload &&
        typeof payload === "object" &&
        (payload as { data?: unknown }).data) as
        Record<string, unknown> | undefined;
      return {
        platformName: String(value?.platformName ?? ""),
        logoUrl: String(value?.logoUrl ?? ""),
        faviconUrl: String(value?.faviconUrl ?? ""),
        primaryColor: String(value?.primaryColor ?? ""),
      };
    },
    buildBody: (values) => ({
      platformName: String(values.platformName ?? ""),
      logoUrl: String(values.logoUrl ?? ""),
      faviconUrl: String(values.faviconUrl ?? ""),
      primaryColor: String(values.primaryColor ?? ""),
    }),
  },
  {
    path: "/saas-admin/platform-settings/localization",
    title: "Localization & Time Zones",
    description: "Default locale, timezone and date formatting.",
    sectionLabel: SECTION,
    fields: [
      { key: "defaultTimezone", label: "Default Timezone", type: "text" },
      { key: "defaultLocale", label: "Default Locale", type: "text" },
      { key: "dateFormat", label: "Date Format", type: "text" },
    ],
    useGet: asQueryHook(useGetLocalizationSettingsQuery),
    useUpdate: asMutationHook(useUpdateLocalizationSettingsMutation),
    getValues: (payload) => {
      const value = (payload &&
        typeof payload === "object" &&
        (payload as { data?: unknown }).data) as
        Record<string, unknown> | undefined;
      return {
        defaultTimezone: String(value?.defaultTimezone ?? ""),
        defaultLocale: String(value?.defaultLocale ?? ""),
        dateFormat: String(value?.dateFormat ?? ""),
      };
    },
    buildBody: (values) => ({
      defaultTimezone: String(values.defaultTimezone ?? ""),
      defaultLocale: String(values.defaultLocale ?? ""),
      dateFormat: String(values.dateFormat ?? ""),
    }),
  },
  {
    path: "/saas-admin/platform-settings/maintenance",
    title: "Maintenance Mode",
    description: "Enable maintenance mode and gate access by IP allowlist.",
    sectionLabel: SECTION,
    fields: [
      { key: "enabled", label: "Maintenance Mode Enabled", type: "boolean" },
      { key: "message", label: "Maintenance Message", type: "textarea" },
      {
        key: "allowedIps",
        label: "Allowed IPs",
        type: "textarea",
        help: "Comma-separated IP addresses that bypass maintenance mode.",
      },
    ],
    useGet: asQueryHook(useGetMaintenanceQuery),
    useUpdate: asMutationHook(useUpdateMaintenanceMutation),
    getValues: (payload) => {
      const value = (payload &&
        typeof payload === "object" &&
        (payload as { data?: unknown }).data) as
        Record<string, unknown> | undefined;
      return {
        enabled: Boolean(value?.enabled),
        message: String(value?.message ?? ""),
        allowedIps: Array.isArray(value?.allowedIps)
          ? (value?.allowedIps as string[]).join(", ")
          : String(value?.allowedIps ?? ""),
      };
    },
    buildBody: (values) => ({
      enabled: Boolean(values.enabled),
      message: String(values.message ?? ""),
      allowedIps: String(values.allowedIps ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }),
    savedMessage: "Maintenance mode updated.",
    stats: (value) => {
      const v = (value as Record<string, unknown> | undefined) ?? {};
      return [
        {
          label: "Maintenance Mode",
          value: Boolean(v.enabled) ? "Enabled" : "Disabled",
          color: Boolean(v.enabled)
            ? ("danger" as const)
            : ("success" as const),
        },
      ];
    },
  },
];
