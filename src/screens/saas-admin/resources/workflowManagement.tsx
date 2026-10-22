import {
  Workflow,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  Rocket,
  Archive,
  Ban,
} from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import { getField } from "../components/resource/helpers";
import {
  useListWorkflowTemplatesQuery,
  useCreateWorkflowTemplateMutation,
  useValidateWorkflowTemplateMutation,
  usePublishWorkflowTemplateMutation,
  useRetireWorkflowTemplateMutation,
  useListWorkflowRunsQuery,
  useCancelWorkflowRunMutation,
} from "@services/saasadmin";

const SECTION = "Workflow Management";

const templateColumns = (
  title: string,
  description: string,
): ResourceListConfig => ({
  path: "",
  title,
  description,
  sectionLabel: SECTION,
  rowId: "templateId",
  source: { kind: "api", useList: asQueryHook(useListWorkflowTemplatesQuery) },
  columns: [
    {
      key: "key",
      header: "Key",
      render: (r) => (
        <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
      ),
    },
    textCol("name", "Name"),
    statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    textCol("currentVersion", "Version"),
    textCol("_count.runs", "Runs"),
  ],
  searchable: (r) => `${r.name} ${r.key}`,
  filters: [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
        { value: "RETIRED", label: "Retired" },
      ],
      placeholder: "All statuses",
    },
  ],
  create: {
    title: "Create Workflow Template",
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
    ],
    useCreate: asMutationHook(useCreateWorkflowTemplateMutation),
  },
  actions: [
    {
      label: "Validate",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      useAction: asMutationHook(useValidateWorkflowTemplateMutation),
      buildArg: (row) => String(row.templateId ?? row.id),
      successMessage: "Template validated.",
    },
    {
      label: "Publish",
      icon: <Rocket className="h-3.5 w-3.5" />,
      useAction: asMutationHook(usePublishWorkflowTemplateMutation),
      buildArg: (row) => String(row.templateId ?? row.id),
      confirm: (row) =>
        `Publish "${row.name}"? The latest draft version becomes active for new runs.`,
      successMessage: "Template published.",
      show: (row) => String(row.status ?? "").toUpperCase() !== "PUBLISHED",
    },
    {
      label: "Retire",
      icon: <Archive className="h-3.5 w-3.5" />,
      variant: "danger",
      useAction: asMutationHook(useRetireWorkflowTemplateMutation),
      buildArg: (row) => String(row.templateId ?? row.id),
      confirm: (row) =>
        `Retire "${row.name}"? No new runs will start from this template.`,
      successMessage: "Template retired.",
      show: (row) => String(row.status ?? "").toUpperCase() === "PUBLISHED",
    },
  ],
  stats: [
    {
      key: "total",
      label: "Templates",
      compute: (rows) => rows.length,
      icon: <Workflow className="h-5 w-5" />,
    },
    {
      key: "published",
      label: "Published",
      compute: (rows) => rows.filter((r) => r.status === "PUBLISHED").length,
      color: "success",
      icon: <Workflow className="h-5 w-5" />,
    },
  ],
});

export const WORKFLOW_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    ...templateColumns(
      "Workflow Builder",
      "Compose and manage automation workflow templates.",
    ),
    path: "/saas-admin/workflow-management/builder",
  },
  {
    ...templateColumns(
      "Workflow Templates",
      "Versioned, reusable automation workflow definitions.",
    ),
    path: "/saas-admin/workflow-management/templates",
  },
  {
    ...templateColumns(
      "Automation Rules",
      "Automation definitions built from workflow templates.",
    ),
    path: "/saas-admin/workflow-management/automation-rules",
  },
  {
    path: "/saas-admin/workflow-management/scheduled-jobs",
    title: "Scheduled Jobs",
    description: "Scheduled workflow runs queued for execution.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListWorkflowRunsQuery) },
    columns: [
      {
        key: "id",
        header: "Run ID",
        render: (r) => (
          <span className="font-mono text-xs">
            {String((r.id ?? r.runId ?? "—").toString().slice(0, 8))}
          </span>
        ),
      },
      textCol("template.name", "Template"),
      textCol("resourceType", "Resource"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      dateCol("startedAt", "Started"),
    ],
    searchable: (r) => `${getField(r, "template.name") ?? ""} ${r.status}`,
    actions: [
      {
        label: "Cancel",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useCancelWorkflowRunMutation),
        buildArg: (row) => String(row.id ?? row.runId),
        confirm: () =>
          "Cancel this scheduled workflow run? It will not execute.",
        successMessage: "Run cancelled.",
        show: (row) =>
          ["QUEUED", "PENDING", "SCHEDULED", "RUNNING"].includes(
            String(row.status ?? "").toUpperCase(),
          ),
      },
    ],
    stats: [
      {
        key: "total",
        label: "Jobs",
        compute: (rows) => rows.length,
        icon: <CalendarDays className="h-5 w-5" />,
      },
      {
        key: "running",
        label: "Running",
        compute: (rows) => rows.filter((r) => r.status === "RUNNING").length,
        color: "info",
        icon: <CalendarDays className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/workflow-management/execution-history",
    title: "Execution History",
    description: "History of workflow executions across tenants.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListWorkflowRunsQuery) },
    columns: [
      {
        key: "id",
        header: "Run ID",
        render: (r) => (
          <span className="font-mono text-xs">
            {String((r.id ?? r.runId ?? "—").toString().slice(0, 8))}
          </span>
        ),
      },
      textCol("template.name", "Template"),
      textCol("resourceType", "Resource"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      dateCol("startedAt", "Started"),
      dateCol("completedAt", "Completed"),
    ],
    searchable: (r) => `${getField(r, "template.name") ?? ""} ${r.status}`,
    actions: [
      {
        label: "Cancel",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useCancelWorkflowRunMutation),
        buildArg: (row) => String(row.id ?? row.runId),
        confirm: () => "Cancel this running workflow execution?",
        successMessage: "Execution cancelled.",
        show: (row) =>
          ["QUEUED", "PENDING", "SCHEDULED", "RUNNING"].includes(
            String(row.status ?? "").toUpperCase(),
          ),
      },
    ],
    stats: [
      {
        key: "total",
        label: "Executions",
        compute: (rows) => rows.length,
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        key: "completed",
        label: "Completed",
        compute: (rows) => rows.filter((r) => r.status === "COMPLETED").length,
        color: "success",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        key: "failed",
        label: "Failed",
        compute: (rows) => rows.filter((r) => r.status === "FAILED").length,
        color: "danger",
        icon: <ClipboardList className="h-5 w-5" />,
      },
    ],
  },
];
