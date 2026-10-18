import { toast } from "react-hot-toast";
import { BarChart3, Users, CreditCard, DollarSign, Activity, ClipboardList, Play, Download, XCircle } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ResourceRowAction } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useReportCatalogQuery,
  useRunReportMutation,
  useListReportRunsQuery,
  useListReportExportsQuery,
  useCreateReportExportMutation,
  useDeleteReportExportMutation,
  downloadReportArtifact,
} from "@services/saasadmin";

const SECTION = "Reports & Analytics";

const RUN_STATUS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "QUEUED", label: "Queued" },
  { value: "RUNNING", label: "Running" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const runExportAction: ResourceRowAction = {
  label: "Export CSV",
  icon: <Download className="h-3.5 w-3.5" />,
  useAction: asMutationHook(useCreateReportExportMutation),
  promptFor: { label: "Reason for export (required, min 4 chars)", required: true },
  buildArg: (row, input) => ({ reportKey: String(row.reportKey ?? ""), format: "CSV", reason: input ?? "" }),
  successMessage: "Export queued. See Exports for status.",
};

export const REPORTS_ANALYTICS_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/reports-analytics/platform-overview",
    title: "Platform Overview",
    description: "Catalog of reports and analytics available on the platform.",
    sectionLabel: SECTION,
    rowId: "key",
    source: { kind: "api", useList: asQueryHook(useReportCatalogQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Report"),
      textCol("description", "Description"),
      textCol("category", "Category"),
      textCol("formats", "Formats"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.description}`,
    actions: [
      {
        label: "Run",
        icon: <Play className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useRunReportMutation),
        buildArg: (row) => ({ reportKey: String(row.key ?? ""), limit: 1000 }),
        successMessage: "Report generated.",
      },
    ],
    stats: [
      { key: "total", label: "Reports", compute: (rows) => rows.length, icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/tenant-usage",
    title: "Tenant Usage Reports",
    description: "Generated tenant usage analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      textCol("requestedBy.email", "Requested By"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: RUN_STATUS, placeholder: "All statuses" }],
    actions: [runExportAction],
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <Users className="h-5 w-5" /> },
      { key: "completed", label: "Completed", compute: (rows) => rows.filter((r) => r.status === "COMPLETED").length, color: "success", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/subscriptions",
    title: "Subscription Reports",
    description: "Generated subscription analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    actions: [runExportAction],
    stats: [

      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <CreditCard className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/revenue",
    title: "Revenue Reports",
    description: "Generated revenue analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    actions: [runExportAction],
    stats: [

      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <DollarSign className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/staff-activity",
    title: "Staff Activity Reports",
    description: "Generated staff activity analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    actions: [runExportAction],
    stats: [

      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/audit",
    title: "Audit Reports",
    description: "Generated audit analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    actions: [runExportAction],
    stats: [

      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/exports",
    title: "Report Exports",
    description: "Queued, completed, and expired report export downloads.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListReportExportsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      {
        key: "downloadable",
        header: "Availability",
        render: (r) => <span className="text-xs">{r.downloadable ? "Ready" : r.expired ? "Expired" : "—"}</span>,
      },
      dateCol("createdAt", "Created"),
      dateCol("expiresAt", "Expires"),
    ],
    searchable: (r) => `${r.reportKey ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: RUN_STATUS }],
    actions: [
      {
        label: "Download",
        icon: <Download className="h-3.5 w-3.5" />,
        show: (r) => Boolean(r.downloadable),
        onClick: (r) => {
          downloadReportArtifact(String(r.id))
            .then(() => toast.success("Export downloaded."))
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Download failed."));
        },
      },
      {
        label: "Cancel",
        icon: <XCircle className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDeleteReportExportMutation),
        buildArg: (r) => String(r.id),
        confirm: "Cancel this export?",
        successMessage: "Export cancelled.",
        show: (r) => String(r.status) === "QUEUED",
      },
    ],
    stats: [
      { key: "total", label: "Exports", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "ready", label: "Ready", compute: (rows) => rows.filter((r) => r.downloadable).length, icon: <Download className="h-5 w-5" /> },
    ],
  },
];