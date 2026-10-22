import {
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Database,
  Power,
  PowerOff,
  Download,
} from "lucide-react";
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
  useListAccessPoliciesQuery,
  useCreateAccessPolicyMutation,
  useEnableAccessPolicyMutation,
  useDisableAccessPolicyMutation,
  useListAuditEventsQuery,
  useCreateAuditExportMutation,
  useAuditSecurityEventsQuery,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetRetentionSettingsQuery,
} from "@services/saasadmin";

const SECTION = "Security & Audit";

const SECURITY_FIELDS_DEF = [
  {
    key: "passwordPolicy",
    label: "Password Policy",
    type: "textarea" as const,
  },
  {
    key: "sessionTimeoutMinutes",
    label: "Session Timeout (min)",
    type: "number" as const,
  },
  {
    key: "requireMfaForStaff",
    label: "Require MFA for Staff",
    type: "boolean" as const,
  },
  { key: "ipAllowlist", label: "IP Allowlist", type: "textarea" as const },
];

const securityGetValues = (payload: unknown) => {
  const value = (payload &&
    typeof payload === "object" &&
    (payload as { data?: unknown }).data) as
    Record<string, unknown> | undefined;
  return {
    passwordPolicy:
      typeof value?.passwordPolicy === "string"
        ? String(value.passwordPolicy)
        : JSON.stringify(value?.passwordPolicy ?? "", null, 2),
    sessionTimeoutMinutes: Number(value?.sessionTimeoutMinutes ?? 60),
    requireMfaForStaff: Boolean(value?.requireMfaForStaff),
    ipAllowlist: Array.isArray(value?.ipAllowlist)
      ? (value?.ipAllowlist as string[]).join(", ")
      : String(value?.ipAllowlist ?? ""),
  };
};

const securityBuildBody = (values: Record<string, unknown>) => ({
  passwordPolicy: String(values.passwordPolicy ?? ""),
  sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes ?? 60),
  requireMfaForStaff: Boolean(values.requireMfaForStaff),
  ipAllowlist: String(values.ipAllowlist ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
});

export const SECURITY_AUDIT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/security-audit/policies",
    title: "Security Policies",
    description: "Access policies governing platform resource access.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListAccessPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      textCol("description", "Description"),
      textCol("policyType", "Type"),
      textCol("priority", "Priority"),
      textCol("rules", "Rules"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description} ${r.policyType}`,
    filters: [{ key: "isEnabled", label: "Enabled only", type: "boolean" }],
    create: {
      title: "Create Security Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "policyType", label: "Policy Type", type: "text" },
        { key: "priority", label: "Priority", type: "number" },
      ],
      useCreate: asMutationHook(useCreateAccessPolicyMutation),
    },
    actions: [
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableAccessPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        confirm: (row) =>
          `Enable policy "${row.name}"? Its rules will be enforced immediately.`,
        successMessage: "Policy enabled.",
        show: (row) => !row.isEnabled,
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableAccessPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        confirm: (row) =>
          `Disable policy "${row.name}"? Enforcement will stop for its rules.`,
        successMessage: "Policy disabled.",
        show: (row) => Boolean(row.isEnabled),
      },
    ],
    stats: [
      {
        key: "total",
        label: "Policies",
        compute: (rows) => rows.length,
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        key: "enabled",
        label: "Enabled",
        compute: (rows) => rows.filter((r) => r.isEnabled).length,
        color: "success",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/security-audit/audit-logs",
    title: "Audit Logs",
    description: "Platform audit trail of actions across all resources.",
    sectionLabel: SECTION,
    rowId: "eventId",
    source: { kind: "api", useList: asQueryHook(useListAuditEventsQuery) },
    columns: [
      {
        key: "id",
        header: "Event",
        render: (r) => (
          <span className="font-mono text-xs">
            {String((r.id ?? r.eventId ?? "—").toString().slice(0, 8))}
          </span>
        ),
      },
      {
        key: "action",
        header: "Action",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.action ?? "—")}</span>
        ),
      },
      textCol("resourceType", "Resource"),
      textCol("resourceId", "Resource ID"),
      textCol("actorEmail", "Actor"),
      statusCol("outcome", "Outcome", (r) =>
        VARIANT_FROM_STATUS(String(r.outcome)),
      ),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) =>
      `${r.action} ${r.resourceType} ${r.actorEmail} ${r.ipAddress}`,
    filters: [
      {
        key: "outcome",
        label: "Outcome",
        type: "select",
        options: [
          { value: "SUCCESS", label: "Success" },
          { value: "FAILURE", label: "Failure" },
          { value: "DENIED", label: "Denied" },
        ],
        placeholder: "All outcomes",
      },
    ],
    actions: [
      {
        label: "Export CSV",
        icon: <Download className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useCreateAuditExportMutation),
        promptFor: {
          label: "Reason for export",
          required: true,
          minLength: 4,
        },
        buildArg: (_row, input) => ({ format: "CSV", reason: input ?? "" }),
        successMessage: "Audit export queued. Check Exports for the download.",
      },
    ],
    stats: [
      {
        key: "total",
        label: "Events",
        compute: (rows) => rows.length,
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        key: "denied",
        label: "Denied",
        compute: (rows) => rows.filter((r) => r.outcome === "DENIED").length,
        color: "danger",
        icon: <ClipboardList className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/security-audit/suspicious-activity",
    title: "Suspicious Activity",
    description: "Security events flagged for review.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useAuditSecurityEventsQuery) },
    columns: [
      {
        key: "id",
        header: "Event",
        render: (r) => (
          <span className="font-mono text-xs">
            {String((r.id ?? "—").toString().slice(0, 8))}
          </span>
        ),
      },
      textCol("eventType", "Type"),
      statusCol("severity", "Severity", (r) =>
        VARIANT_FROM_STATUS(String(r.severity)),
      ),
      textCol("details", "Details"),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) => `${r.eventType} ${r.details} ${r.ipAddress}`,
    filters: [
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: [
          { value: "INFO", label: "Info" },
          { value: "LOW", label: "Low" },
          { value: "MEDIUM", label: "Medium" },
          { value: "HIGH", label: "High" },
          { value: "CRITICAL", label: "Critical" },
        ],
        placeholder: "All severities",
      },
    ],
    stats: [
      {
        key: "total",
        label: "Events",
        compute: (rows) => rows.length,
        icon: <AlertTriangle className="h-5 w-5" />,
      },
      {
        key: "high",
        label: "High / Critical",
        compute: (rows) =>
          rows.filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL")
            .length,
        color: "danger",
        icon: <AlertTriangle className="h-5 w-5" />,
      },
    ],
  },
];

export function extractRetentionRows(payload: unknown): ResourceRow[] {
  const value = (payload &&
    typeof payload === "object" &&
    (payload as { data?: unknown }).data) as
    Record<string, unknown> | undefined;
  const settings = value?.settings as Record<string, unknown> | undefined;
  const policies = settings?.policies ?? (value?.policies as unknown) ?? [];
  return Array.isArray(policies) ? (policies as ResourceRow[]) : [];
}

export const SECURITY_AUDIT_EXTRA_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/security-audit/data-retention",
    title: "Data Retention",
    description:
      "Retention policies controlling how long platform data is kept.",
    sectionLabel: SECTION,
    rowId: "resourceKey",
    source: {
      kind: "api",
      useList: asQueryHook(useGetRetentionSettingsQuery),
      extractRows: extractRetentionRows,
    },
    columns: [
      {
        key: "resourceKey",
        header: "Resource",
        render: (r) => (
          <span className="font-mono text-xs">
            {String(r.resourceKey ?? "—")}
          </span>
        ),
      },
      textCol("retentionDays", "Retention (days)"),
      statusCol("action", "Action", (r) =>
        VARIANT_FROM_STATUS(String(r.action)),
      ),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.resourceKey}`,
    stats: [
      {
        key: "total",
        label: "Policies",
        compute: (rows) => rows.length,
        icon: <Database className="h-5 w-5" />,
      },
    ],
  },
];

export const SECURITY_AUDIT_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/security-audit/login-session",
    title: "Login & Session Policies",
    description: "Login, session timeout and password policy for the platform.",
    sectionLabel: SECTION,
    fields: SECURITY_FIELDS_DEF,
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: securityGetValues,
    buildBody: securityBuildBody,
  },
  {
    path: "/saas-admin/security-audit/mfa",
    title: "MFA Configuration",
    description: "Multi-factor authentication enforcement for platform access.",
    sectionLabel: SECTION,
    fields: [
      {
        key: "requireMfaForStaff",
        label: "Require MFA for Staff",
        type: "boolean",
        help: "Staff must enroll a second factor before accessing the platform.",
      },
      {
        key: "sessionTimeoutMinutes",
        label: "Session Timeout (min)",
        type: "number",
      },
      { key: "passwordPolicy", label: "Password Policy", type: "textarea" },
    ],
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: securityGetValues,
    buildBody: securityBuildBody,
    savedMessage: "MFA settings saved.",
  },
];
