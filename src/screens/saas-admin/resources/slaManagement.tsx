import { ShieldCheck, Target, AlertTriangle, Activity, Power, PowerOff } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListSlaPoliciesQuery,
  useCreateSlaPolicyMutation,
  useEnableSlaPolicyMutation,
  useDisableSlaPolicyMutation,
  useListEscalationRulesQuery,
  useCreateEscalationRuleMutation,
} from "@services/saasadmin";

const SECTION = "SLA Management";

export const SLA_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/sla-management/policies",
    title: "SLA Policies",
    description: "Platform-wide SLA policies applied to tenant assignments.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListSlaPoliciesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("serviceLevels", "Service Levels"),
      textCol("_count.escalationRules", "Escalation Rules"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "DRAFT", label: "Draft" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create SLA Policy",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateSlaPolicyMutation),
    },
    actions: [
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableSlaPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        confirm: (row) => `Enable SLA policy "${row.name}"? It will apply to assigned tenants.`,
        successMessage: "Policy enabled.",
        show: (row) => String(row.status ?? "").toUpperCase() !== "ENABLED",
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableSlaPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        confirm: (row) => `Disable SLA policy "${row.name}"? Assigned tenants will lose these targets.`,
        successMessage: "Policy disabled.",
        show: (row) => String(row.status ?? "").toUpperCase() === "ENABLED",
      },
    ],
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/targets",
    title: "SLA Targets",
    description: "SLA service levels define response and resolution targets.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListSlaPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("serviceLevels", "Targets"),
      textCol("settings", "Settings"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <Target className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/escalation-rules",
    title: "Escalation Rules",
    description: "Rules that escalate work items when SLA thresholds are breached.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("trigger", "Trigger"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("actions", "Actions"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    create: {
      title: "Create Escalation Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "trigger", label: "Trigger", type: "text" },
        { key: "thresholdMinutes", label: "Threshold (minutes)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateEscalationRuleMutation),
    },
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <AlertTriangle className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/breaches",
    title: "SLA Breach Monitoring",
    description: "Escalation rules drive detection and handling of SLA breaches.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("actions", "On breach"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
      { key: "enabled", label: "Active", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Activity className="h-5 w-5" /> },
    ],
  },
];