import { ShieldCheck, Activity } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig, ResourceRow } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useGetMySecurityQuery,
  useListMySessionsQuery,
  useRevokeMySessionMutation,
} from "@services/saasadmin";

const SECTION = "My Account";

export const MY_ACCOUNT_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/my-account/profile",
    title: "My Profile",
    description: "Your personal preferences and portal defaults.",
    sectionLabel: SECTION,
    fields: [
      { key: "timezone", label: "Timezone", type: "text" },
      { key: "locale", label: "Locale", type: "text" },
      { key: "theme", label: "Theme", type: "select", options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }] },
      { key: "density", label: "UI Density", type: "select", options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }] },
      { key: "landingPage", label: "Landing Page", type: "text" },
      { key: "emailNotifications", label: "Email Notifications", type: "textarea", help: "JSON preferences for which emails you receive." },
    ],
    useGet: asQueryHook(useGetMyPreferencesQuery),
    useUpdate: asMutationHook(useUpdateMyPreferencesMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        timezone: String(value?.timezone ?? ""),
        locale: String(value?.locale ?? ""),
        theme: String(value?.theme ?? "system"),
        density: String(value?.density ?? "comfortable"),
        landingPage: String(value?.landingPage ?? ""),
        emailNotifications: JSON.stringify(value?.emailNotifications ?? {}, null, 2),
      };
    },
    buildBody: (values) => ({
      timezone: String(values.timezone ?? ""),
      locale: String(values.locale ?? ""),
      theme: String(values.theme ?? "system"),
      density: String(values.density ?? "comfortable"),
      landingPage: String(values.landingPage ?? ""),
      emailNotifications: (() => {
        try {
          return JSON.parse(String(values.emailNotifications ?? "{}"));
        } catch {
          return {};
        }
      })(),
    }),
  },
];

export const MY_ACCOUNT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/my-account/mfa-security",
    title: "MFA & Security",
    description: "Recent security events on your account.",
    sectionLabel: SECTION,
    rowId: "id",
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      extractRows: (payload) => {
        const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
        const events = Array.isArray(value?.recentSecurityEvents) ? (value?.recentSecurityEvents as ResourceRow[]) : [];
        return events.map((e, i) => ({ id: String((e.id ?? i).toString()), ...e }));
      },
    },
    columns: [
      textCol("eventType", "Event"),
      statusCol("severity", "Severity", (r) => VARIANT_FROM_STATUS(String(r.severity))),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) => `${r.eventType} ${r.details} ${r.ipAddress}`,
    stats: [
      { key: "total", label: "Events", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/my-account/sessions",
    title: "Active Sessions",
    description: "Devices and sessions currently signed in as you.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListMySessionsQuery) },
    quickAction: {
      label: "Revoke",
      icon: <Activity className="h-3.5 w-3.5" />,
      useAction: asMutationHook(useRevokeMySessionMutation),
      buildArg: (row) => row.sessionId ?? row.id,
      successMessage: () => "Session revoked.",
    },
    columns: [
      textCol("userAgent", "Device"),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "Signed In"),
      dateCol("lastUsedAt", "Last Used"),
      dateCol("expiresAt", "Expires"),
      textCol("isCurrent", "Current"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.userAgent} ${r.ipAddress}`,
    stats: [
      { key: "total", label: "Sessions", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => r.isActive !== false && !r.revokedAt).length, color: "success", icon: <Activity className="h-5 w-5" /> },
    ],
  },
];