import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListSlaPolicyQuery,
  useListEscalationRuleQuery,
  useListBusinessCalendarQuery,
  useCreateSlaPolicyMutation,
  useCreateEscalationRuleMutation,
  useCreateBusinessCalendarMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const POLICY_PATH = "/organization/sla-service-performance/sla-policies";
const ESCALATION_PATH = "/organization/sla-service-performance/escalation-rules";
const CAL_PATH = "/organization/sla-service-performance/business-calendars";

const policyColumns: Column<any>[] = [
  { key: "name", header: "SLA Policy", render: (row: any) => row.name },
  { key: "responseTime", header: "Response Target", render: (row: any) => `${row.responseTimeMinutes} min` },
  { key: "resolutionTime", header: "Resolution Target", render: (row: any) => `${row.resolutionTimeMinutes} min` },
  { key: "calendar", header: "Calendar", render: (row: any) => row.calendar?.name || "24/7" },
  statusColumn<any>("status"),
];

const escColumns: Column<any>[] = [
  { key: "name", header: "Escalation Rule", render: (row: any) => row.name },
  { key: "trigger", header: "Trigger", render: (row: any) => row.triggerCondition || "-" },
  { key: "action", header: "Action", render: (row: any) => row.actionType || "-" },
  { key: "target", header: "Target", render: (row: any) => row.targetUser?.displayName || row.targetGroup?.name || "-" },
  statusColumn<any>("status"),
];

const calColumns: Column<any>[] = [
  { key: "name", header: "Calendar", render: (row: any) => row.name },
  { key: "timezone", header: "Timezone", render: (row: any) => row.timezone },
  { key: "isDefault", header: "Default", render: (row: any) => row.isDefault ? "Yes" : "No" },
  statusColumn<any>("status"),
];

export const slaConfigs: ResourceListConfig[] = [
  {
    path: POLICY_PATH,
    title: "SLA Policies",
    description: "Service level agreements and targets",
    sectionLabel: "SLA & Service Performance",
    rowId: "id",
    columns: policyColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSlaPolicyQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Paused", value: "PAUSED" },
          { label: "Breached", value: "BREACHED" },
          { label: "Met", value: "MET" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${POLICY_PATH}/${row.id}`,
    create: {
      title: "Create SLA Policy",
      description: "Create a new SLA policy.",
      fields: [
        { key: "name", label: "Policy name", type: "text", required: true },
        { key: "responseTimeMinutes", label: "Response time (min)", type: "number", required: true },
        { key: "resolutionTimeMinutes", label: "Resolution time (min)", type: "number", required: true },
        { key: "calendarId", label: "Business calendar ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateSlaPolicyMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, responseTimeMinutes: Number(values.responseTimeMinutes), resolutionTimeMinutes: Number(values.resolutionTimeMinutes), calendarId: values.calendarId }),
      successMessage: "SLA policy created",
    },
  },
  {
    path: ESCALATION_PATH,
    title: "Escalation Rules",
    description: "SLA breach escalation rules",
    sectionLabel: "SLA & Service Performance",
    rowId: "id",
    columns: escColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListEscalationRuleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.triggerCondition || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${ESCALATION_PATH}/${row.id}`,
    create: {
      title: "Create Escalation Rule",
      description: "Create a new escalation rule.",
      fields: [
        { key: "name", label: "Rule name", type: "text", required: true },
        { key: "triggerCondition", label: "Trigger condition", type: "textarea", required: true },
        { key: "actionType", label: "Action type", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateEscalationRuleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, triggerCondition: values.triggerCondition, actionType: values.actionType }),
      successMessage: "Escalation rule created",
    },
  },
  {
    path: CAL_PATH,
    title: "Business Calendars",
    description: "Business hours and holiday calendars",
    sectionLabel: "SLA & Service Performance",
    rowId: "id",
    columns: calColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListBusinessCalendarQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${CAL_PATH}/${row.id}`,
    create: {
      title: "Create Calendar",
      description: "Create a new business calendar.",
      fields: [
        { key: "name", label: "Calendar name", type: "text", required: true },
        { key: "timezone", label: "Timezone", type: "text", required: true },
        { key: "isDefault", label: "Default calendar", type: "boolean" },
      ],
      useCreate: asMutationHook(useCreateBusinessCalendarMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, timezone: values.timezone, isDefault: values.isDefault === true }),
      successMessage: "Calendar created",
    },
  },
];