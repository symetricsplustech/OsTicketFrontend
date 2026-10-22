import {
  Activity,
  Cpu,
  ClipboardList,
  Database,
  RotateCw,
  Ban,
} from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type {
  ResourceListConfig,
  ResourceRow,
} from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useSystemHealthQuery,
  useListSystemJobsQuery,
  useRetrySystemJobMutation,
  useCancelSystemJobMutation,
  useListSystemQueuesQuery,
  useSystemDiagnosticsQuery,
} from "@services/saasadmin";

const SECTION = "System Administration";

function objectToRows(
  payload: unknown,
  mapping: (rec: Record<string, unknown>) => ResourceRow[],
): ResourceRow[] {
  const value = (payload &&
    typeof payload === "object" &&
    (payload as { data?: unknown }).data) as
    Record<string, unknown> | undefined;
  if (!value || typeof value !== "object") return [];
  return mapping(value);
}

const healthRows = (rec: Record<string, unknown>): ResourceRow[] => {
  const components = ["database", "redis", "storage", "queues", "scheduler"];
  const base: ResourceRow[] = [
    {
      component: "Platform",
      status: rec.status ?? "n/a",
      detail:
        `${String(rec.environment ?? "")} ${String(rec.version ?? "")}`.trim(),
      latencyMs: "—",
    },
  ];
  for (const c of components) {
    const info = (rec[c] ?? {}) as Record<string, unknown>;
    base.push({
      component: c,
      status: info.status ?? "n/a",
      detail: info.detail ?? "",
      latencyMs: info.latencyMs ?? "—",
    });
  }
  return base;
};

const diagnosticsRows = (rec: Record<string, unknown>): ResourceRow[] => {
  const checks = Array.isArray(rec.checks)
    ? (rec.checks as Record<string, unknown>[])
    : [];
  const base = checks.map((c, i) => ({
    component: String(c.name ?? `Check ${i + 1}`),
    status: c.status ?? "n/a",
    detail: c.detail ?? "",
  }));
  base.push({
    component: "Memory",
    status: (rec.memory as Record<string, unknown>)?.status ?? "n/a",
    detail: String((rec.memory as Record<string, unknown>)?.detail ?? ""),
  });
  base.push({
    component: "Storage",
    status: (rec.storage as Record<string, unknown>)?.status ?? "n/a",
    detail: String((rec.storage as Record<string, unknown>)?.detail ?? ""),
  });
  return base;
};

const queueRows = (rec: Record<string, unknown>): ResourceRow[] =>
  Object.entries(rec).map(([queue, info]) => {
    const detail =
      info && typeof info === "object"
        ? JSON.stringify(info)
        : String(info ?? "");
    return { queue, status: "ok", detail };
  });

const JOB_STATUS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "QUEUED", label: "Queued" },
  { value: "RUNNING", label: "Running" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const SYSTEM_ADMINISTRATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/system-administration/health",
    title: "System Health",
    description: "Live health of platform services, storage and schedulers.",
    sectionLabel: SECTION,
    rowId: "component",
    source: {
      kind: "api",
      useList: asQueryHook(useSystemHealthQuery),
      extractRows: (payload) => objectToRows(payload, healthRows),
    },
    columns: [
      textCol("component", "Component"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("detail", "Detail"),
      textCol("latencyMs", "Latency (ms)"),
    ],
    searchable: (r) => `${r.component} ${r.detail}`,
    stats: [
      {
        key: "healthy",
        label: "Healthy Components",
        compute: (rows) =>
          rows.filter((r) => r.status === "ok" || r.status === "healthy")
            .length,
        color: "success",
        icon: <Activity className="h-5 w-5" />,
      },
      {
        key: "degraded",
        label: "Degraded",
        compute: (rows) => rows.filter((r) => r.status === "degraded").length,
        color: "warning",
        icon: <Activity className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/system-administration/background-jobs",
    title: "Background Jobs",
    description: "Queued and running background jobs across the platform.",
    sectionLabel: SECTION,
    rowId: "jobId",
    source: { kind: "api", useList: asQueryHook(useListSystemJobsQuery) },
    columns: [
      {
        key: "id",
        header: "Job",
        render: (r) => (
          <span className="font-mono text-xs">
            {String((r.id ?? r.jobId ?? "—").toString().slice(0, 8))}
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.type ?? "—")}</span>
        ),
      },
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("attempts", "Attempts"),
      textCol("error", "Last Error"),
      dateCol("scheduledFor", "Scheduled"),
      dateCol("startedAt", "Started"),
    ],
    searchable: (r) => `${r.type} ${r.status} ${r.error}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: JOB_STATUS,
        placeholder: "All statuses",
      },
    ],
    actions: [
      {
        label: "Retry",
        icon: <RotateCw className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useRetrySystemJobMutation),
        buildArg: (row) => String(row.jobId ?? row.id),
        confirm: (row) =>
          `Retry job "${String(row.type ?? row.id).slice(0, 24)}"? It will be queued for a fresh attempt.`,
        successMessage: "Job requeued.",
        show: (row) =>
          ["FAILED", "CANCELLED", "DEAD"].includes(
            String(row.status ?? "").toUpperCase(),
          ),
      },
      {
        label: "Cancel",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useCancelSystemJobMutation),
        buildArg: (row) => String(row.jobId ?? row.id),
        confirm: (row) =>
          `Cancel job "${String(row.type ?? row.id).slice(0, 24)}"? Work in progress will be abandoned.`,
        successMessage: "Job cancelled.",
        show: (row) =>
          ["QUEUED", "PENDING", "RUNNING", "SCHEDULED"].includes(
            String(row.status ?? "").toUpperCase(),
          ),
      },
    ],
    stats: [
      {
        key: "total",
        label: "Jobs",
        compute: (rows) => rows.length,
        icon: <Cpu className="h-5 w-5" />,
      },
      {
        key: "running",
        label: "Running",
        compute: (rows) => rows.filter((r) => r.status === "RUNNING").length,
        color: "info",
        icon: <Cpu className="h-5 w-5" />,
      },
      {
        key: "failed",
        label: "Failed",
        compute: (rows) => rows.filter((r) => r.status === "FAILED").length,
        color: "danger",
        icon: <Cpu className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/system-administration/queues",
    title: "Queue Monitoring",
    description: "Backlog and depth of platform worker queues.",
    sectionLabel: SECTION,
    rowId: "queue",
    source: {
      kind: "api",
      useList: asQueryHook(useListSystemQueuesQuery),
      extractRows: (payload) => objectToRows(payload, queueRows),
    },
    columns: [textCol("queue", "Queue"), textCol("detail", "Contents")],
    searchable: (r) => `${r.queue} ${r.detail}`,
    stats: [
      {
        key: "total",
        label: "Queues",
        compute: (rows) => rows.length,
        icon: <ClipboardList className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/system-administration/database",
    title: "Database Status",
    description: "Database journey and storage diagnostics.",
    sectionLabel: SECTION,
    rowId: "component",
    source: {
      kind: "api",
      useList: asQueryHook(useSystemDiagnosticsQuery),
      extractRows: (payload) => objectToRows(payload, diagnosticsRows),
    },
    columns: [
      textCol("component", "Check"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("detail", "Detail"),
    ],
    searchable: (r) => `${r.component} ${r.detail}`,
    stats: [
      {
        key: "ok",
        label: "Checks Passing",
        compute: (rows) =>
          rows.filter(
            (r) =>
              r.status === "ok" ||
              r.status === "healthy" ||
              r.status === "passed" ||
              r.status === true,
          ).length,
        color: "success",
        icon: <Database className="h-5 w-5" />,
      },
    ],
  },
];
