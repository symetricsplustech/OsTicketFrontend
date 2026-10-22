import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListWorkflowQuery,
  useListWorkflowRunQuery,
  useListAutomationRuleQuery,
  useListAutomationRunQuery,
  useListApprovalPolicyQuery,
  useListApprovalRequestQuery,
  useCreateWorkflowMutation,
  useCreateWorkflowRunMutation,
  useCreateAutomationRuleMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const WF_PATH = "/organization/workflow-automation/workflow-definitions";
const WFR_PATH = "/organization/workflow-automation/workflow-execution-history";
const AUTO_PATH = "/organization/workflow-automation/automation-rules";
const AUTORUN_PATH = "/organization/workflow-automation/automation-logs";

const wfColumns: Column<any>[] = [
  { key: "name", header: "Workflow", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "version", header: "Version", render: (row: any) => row.version || "-" },
  statusColumn<any>("status"),
];

const wfrColumns: Column<any>[] = [
  { key: "id", header: "Run ID", render: (row: any) => row.id },
  { key: "workflow", header: "Workflow", render: (row: any) => row.workflow?.name || "-" },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  { key: "completedAt", header: "Completed", render: (row: any) => row.completedAt ? new Date(row.completedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const autoColumns: Column<any>[] = [
  { key: "name", header: "Rule", render: (row: any) => row.name },
  { key: "trigger", header: "Trigger", render: (row: any) => row.triggerType || "-" },
  { key: "target", header: "Target", render: (row: any) => row.targetType || "-" },
  statusColumn<any>("status"),
];

const autorunColumns: Column<any>[] = [
  { key: "id", header: "Run ID", render: (row: any) => row.id },
  { key: "rule", header: "Rule", render: (row: any) => row.rule?.name || "-" },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

export const workflowsConfigs: ResourceListConfig[] = [
  {
    path: WF_PATH,
    title: "Workflow Definitions",
    description: "Workflow designer and version control",
    sectionLabel: "Workflow & Automation",
    rowId: "id",
    columns: wfColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListWorkflowQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Published", value: "PUBLISHED" },
          { label: "Draft", value: "DRAFT" },
          { label: "Failed", value: "FAILED" },
          { label: "Retired", value: "RETIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${WF_PATH}/${row.id}`,
    create: {
      title: "Create Workflow",
      description: "Create a new workflow definition.",
      fields: [
        { key: "name", label: "Workflow name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "definition", label: "Definition (JSON)", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateWorkflowMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, definition: values.definition ? JSON.parse(values.definition as string) : {} }),
      successMessage: "Workflow created",
    },
  },
  {
    path: WFR_PATH,
    title: "Workflow Execution History",
    description: "Workflow run history and debugging",
    sectionLabel: "Workflow & Automation",
    rowId: "id",
    columns: wfrColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListWorkflowRunQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.workflow?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Running", value: "RUNNING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Failed", value: "FAILED" },
          { label: "Cancelled", value: "CANCELLED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${WFR_PATH}/${row.id}`,
    create: {
      title: "Start Workflow Run",
      description: "Execute a workflow with custom input.",
      fields: [
        { key: "workflowId", label: "Workflow ID", type: "text", required: true },
        { key: "input", label: "Input (JSON)", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateWorkflowRunMutation),
      buildBody: (values: Record<string, unknown>) => ({ workflowId: values.workflowId, input: values.input ? JSON.parse(values.input as string) : {} }),
      successMessage: "Workflow run started",
    },
  },
  {
    path: AUTO_PATH,
    title: "Automation Rules",
    description: "Business rules and trigger configurations",
    sectionLabel: "Workflow & Automation",
    rowId: "id",
    columns: autoColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAutomationRuleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.triggerType || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Published", value: "PUBLISHED" },
          { label: "Draft", value: "DRAFT" },
          { label: "Retired", value: "RETIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${AUTO_PATH}/${row.id}`,
    create: {
      title: "Create Automation Rule",
      description: "Create a new business rule.",
      fields: [
        { key: "name", label: "Rule name", type: "text", required: true },
        { key: "triggerType", label: "Trigger type", type: "text", required: true },
        { key: "condition", label: "Condition", type: "textarea" },
        { key: "actions", label: "Actions (JSON)", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateAutomationRuleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, triggerType: values.triggerType, condition: values.condition, actions: values.actions ? JSON.parse(values.actions as string) : [] }),
      successMessage: "Automation rule created",
    },
  },
  {
    path: AUTORUN_PATH,
    title: "Automation Runs",
    description: "Automation rule execution history",
    sectionLabel: "Workflow & Automation",
    rowId: "id",
    columns: autorunColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAutomationRunQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.rule?.name || ''}`,
    pageSize: 20,
    detailPath: (row: any) => `${AUTORUN_PATH}/${row.id}`,
  },
  {
    path: "/organization/workflow-automation/approval-workflows",
    title: "Approval Workflows",
    description: "Policies requiring approvals for changes and access",
    sectionLabel: "Workflow & Automation",
    rowId: "id",
    columns: [
      { key: "name", header: "Policy", render: (row: any) => row.name },
      { key: "actionScope", header: "Scope", render: (row: any) => row.actionScope },
      { key: "minApprovals", header: "Min Approvals", render: (row: any) => row.minApprovals },
      { key: "approverRoles", header: "Approver Roles", render: (row: any) => (Array.isArray(row.approverRoleIds) ? row.approverRoleIds.length : 0) },
      { key: "isEnabled", header: "Enabled", render: (row: any) => row.isEnabled ? "Yes" : "No" },
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useListApprovalPolicyQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.actionScope}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/workflow-automation/approval-workflows/${row.id}`,
  },
  {
    path: "/organization/knowledge-management/review-and-approval-queue",
    title: "Review and Approval Queue",
    description: "Pending and decided approval requests across the organization",
    sectionLabel: "Knowledge Management",
    rowId: "id",
    columns: [
      { key: "actionKey", header: "Action", render: (row: any) => row.actionKey },
      { key: "resourceType", header: "Resource", render: (row: any) => row.resourceType },
      statusColumn<any>("status"),
      { key: "requestedBy", header: "Requested By", render: (row: any) => row.requestedById || "-" },
      {
        key: "createdAt",
        header: "Requested",
        render: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"),
      },
      {
        key: "decidedAt",
        header: "Decided",
        render: (row: any) => (row.decidedAt ? new Date(row.decidedAt).toLocaleString() : "-"),
      },
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useListApprovalRequestQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.actionKey} ${row.resourceType} ${row.status}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
        ],
      },
    ],
    pageSize: 20,
  },
];