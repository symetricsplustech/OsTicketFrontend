import { Network, KeyRound, Globe, ClipboardList, RotateCw, Ban, Power, PowerOff, Send } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig, RevealPayload } from "../components/resource/types";
import { mutationBody } from "../components/resource/helpers";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListIntegrationsQuery,
  useCreateIntegrationMutation,
  useTestIntegrationMutation,
  useEnableIntegrationMutation,
  useDisableIntegrationMutation,
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useRotateApiKeyMutation,
  useRevokeApiKeyMutation,
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useEnableWebhookMutation,
  useDisableWebhookMutation,
  useTestWebhookMutation,
  useRotateWebhookSecretMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} from "@services/saasadmin";

function secretReveal(title: string, label: string): (result: unknown) => RevealPayload | null {
  return (result) => {
    const body = mutationBody(result);
    const secret = String(body.secret ?? "");
    if (!secret) return null;
    return {
      title,
      fields: [{ label, value: secret, masked: true }],
      warning: "Copy this value now — it will not be shown again.",
    };
  };
}

const SECTION = "Integrations & API";

export const INTEGRATIONS_API_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/integrations-api/directory",
    title: "Integration Directory",
    description: "Third-party integrations available on the platform.",
    sectionLabel: SECTION,
    rowId: "integrationId",
    source: { kind: "api", useList: asQueryHook(useListIntegrationsQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? r.id ?? "—")}</span> },
      textCol("name", "Integration"),
      textCol("provider", "Provider"),
      textCol("category", "Category"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("configured", "Configured"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.provider} ${r.category}`,
    actions: [
      {
        label: "Test",
        icon: <Send className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useTestIntegrationMutation),
        buildArg: (row) => String(row.integrationId ?? row.id),
        successMessage: "Connection test completed.",
      },
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableIntegrationMutation),
        buildArg: (row) => String(row.integrationId ?? row.id),
        successMessage: "Integration enabled.",
        show: (row) => String(row.status ?? "").toUpperCase() === "DISABLED" && !row.isEnabled,
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableIntegrationMutation),
        buildArg: (row) => String(row.integrationId ?? row.id),
        confirm: (row) => `Disable the integration "${row.name}"? Connected features will stop syncing.`,
        successMessage: "Integration disabled.",
        show: (row) => row.status === "ENABLED" || Boolean(row.isEnabled),
      },
    ],
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "UNCONFIGURED", label: "Unconfigured" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Add Integration",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "provider", label: "Provider", type: "text" },
        { key: "category", label: "Category", type: "text" },
      ],
      useCreate: asMutationHook(useCreateIntegrationMutation),
    },
    stats: [
      { key: "total", label: "Integrations", compute: (rows) => rows.length, icon: <Network className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED" || r.isEnabled).length, color: "success", icon: <Network className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/api-keys",
    title: "API Keys",
    description: "Platform API keys with scoped access and rotation.",
    sectionLabel: SECTION,
    rowId: "keyId",
    source: { kind: "api", useList: asQueryHook(useListApiKeysQuery) },
    columns: [
      textCol("name", "Name"),
      { key: "keyPrefix", header: "Key Prefix", render: (r) => <span className="font-mono text-xs">{String(r.keyPrefix ?? "—")}</span> },
      textCol("scopes", "Scopes"),
      dateCol("lastUsedAt", "Last Used"),
      dateCol("expiresAt", "Expires"),
      textCol("revokedAt", "Revoked"),
    ],
    searchable: (r) => `${r.name} ${r.keyPrefix}`,
    actions: [
      {
        label: "Rotate",
        icon: <RotateCw className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useRotateApiKeyMutation),
        buildArg: (row) => String(row.keyId ?? row.id),
        confirm: (row) => `Rotate the API key "${row.name}"? The current secret will be revoked immediately and a new secret issued.`,
        successMessage: "API key rotated.",
        reveal: secretReveal("API Key Rotated", "New Secret"),
        show: (row) => !row.revokedAt,
      },
      {
        label: "Revoke",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useRevokeApiKeyMutation),
        buildArg: (row) => String(row.keyId ?? row.id),
        confirm: (row) => `Revoke the API key "${row.name}"? Applications using it will lose access immediately.`,
        successMessage: "API key revoked.",
        show: (row) => !row.revokedAt,
      },
    ],
    create: {
      title: "Create API Key",
      description: "The secret is shown once after creation.",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "scopes", label: "Scopes", type: "text", help: "Comma-separated scopes" },
        { key: "tenantId", label: "Tenant (optional)", type: "text" },
      ],
      useCreate: asMutationHook(useCreateApiKeyMutation),
      successMessage: "API key created.",
      reveal: secretReveal("API Key Created", "Secret"),
    },
    stats: [
      { key: "total", label: "API Keys", compute: (rows) => rows.length, icon: <KeyRound className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => !r.revokedAt).length, color: "success", icon: <KeyRound className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/webhooks",
    title: "Webhooks",
    description: "Outbound webhook subscriptions with delivery retries.",
    sectionLabel: SECTION,
    rowId: "webhookId",
    source: { kind: "api", useList: asQueryHook(useListWebhooksQuery) },
    columns: [
      textCol("name", "Webhook"),
      textCol("url", "URL"),
      textCol("eventKeys", "Events"),
      textCol("failureCount", "Failures"),
      dateCol("lastDeliveryAt", "Last Delivery"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.url}`,
    actions: [
      {
        label: "Send Test",
        icon: <Send className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useTestWebhookMutation),
        buildArg: (row) => String(row.webhookId ?? row.id),
        successMessage: "Test delivery queued.",
        show: (row) => Boolean(row.isEnabled),
      },
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableWebhookMutation),
        buildArg: (row) => String(row.webhookId ?? row.id),
        successMessage: "Webhook enabled.",
        show: (row) => !row.isEnabled,
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableWebhookMutation),
        buildArg: (row) => String(row.webhookId ?? row.id),
        confirm: (row) => `Disable the webhook "${row.name}"? No events will be delivered until it is re-enabled.`,
        successMessage: "Webhook disabled.",
        show: (row) => Boolean(row.isEnabled),
      },
      {
        label: "Rotate Secret",
        icon: <RotateCw className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useRotateWebhookSecretMutation),
        buildArg: (row) => String(row.webhookId ?? row.id),
        confirm: (row) => `Rotate the signing secret for "${row.name}"? Update the receiver before the next delivery.`,
        successMessage: "Webhook secret rotated.",
        reveal: secretReveal("Webhook Secret Rotated", "Signing Secret"),
      },
    ],
    create: {
      title: "Create Webhook",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "url", label: "URL", type: "text", required: true },
        { key: "eventKeys", label: "Event Keys", type: "text", help: "Comma-separated" },
      ],
      useCreate: asMutationHook(useCreateWebhookMutation),
      successMessage: "Webhook created.",
      reveal: secretReveal("Webhook Created", "Signing Secret"),
    },
    stats: [
      { key: "total", label: "Webhooks", compute: (rows) => rows.length, icon: <Globe className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Globe className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/oauth",
    title: "OAuth Applications",
    description: "API-key-backed applications that provision OAuth client access.",
    sectionLabel: SECTION,
    rowId: "keyId",
    source: { kind: "api", useList: asQueryHook(useListApiKeysQuery) },
    columns: [
      textCol("name", "Application"),
      { key: "keyPrefix", header: "Client Prefix", render: (r) => <span className="font-mono text-xs">{String(r.keyPrefix ?? "—")}</span> },
      textCol("scopes", "Scopes"),
      dateCol("lastUsedAt", "Last Used"),
    ],
    searchable: (r) => `${r.name} ${r.keyPrefix}`,
    stats: [
      { key: "total", label: "Applications", compute: (rows) => rows.length, icon: <Network className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/logs",
    title: "Integration Logs",
    description: "Integration connectivity, test results and recent activity.",
    sectionLabel: SECTION,
    rowId: "integrationId",
    source: { kind: "api", useList: asQueryHook(useListIntegrationsQuery) },
    columns: [
      textCol("name", "Integration"),
      textCol("provider", "Provider"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("lastTestedAt", "Last Tested"),
      textCol("lastTestResult", "Result"),
    ],
    searchable: (r) => `${r.name} ${r.provider}`,
    stats: [
      { key: "total", label: "Integrations", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "error", label: "Error", compute: (rows) => rows.filter((r) => r.status === "ERROR").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];

export const INTEGRATIONS_API_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/integrations-api/sso",
    title: "SSO Configuration",
    description: "Security settings that govern single sign-on and session policy.",
    sectionLabel: SECTION,
    fields: [
      { key: "passwordPolicy", label: "Password Policy", type: "textarea" },
      { key: "sessionTimeoutMinutes", label: "Session Timeout (min)", type: "number" },
      { key: "requireMfaForStaff", label: "Require MFA for Staff", type: "boolean" },
      { key: "ipAllowlist", label: "IP Allowlist", type: "textarea" },
    ],
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        passwordPolicy: JSON.stringify(value?.passwordPolicy ?? "", null, 2),
        sessionTimeoutMinutes: Number(value?.sessionTimeoutMinutes ?? 60),
        requireMfaForStaff: Boolean(value?.requireMfaForStaff),
        ipAllowlist: Array.isArray(value?.ipAllowlist) ? (value?.ipAllowlist as string[]).join(", ") : String(value?.ipAllowlist ?? ""),
      };
    },
    buildBody: (values) => ({
      passwordPolicy: String(values.passwordPolicy ?? ""),
      sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes ?? 60),
      requireMfaForStaff: Boolean(values.requireMfaForStaff),
      ipAllowlist: String(values.ipAllowlist ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    }),
    savedMessage: "SSO settings saved.",
  },
];