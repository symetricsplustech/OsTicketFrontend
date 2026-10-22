import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListReportCatalogQuery,
  useListReportRunsQuery,
  useListExportJobQuery,
  useListImportJobQuery,
  useListSupportTicketQuery,
  useCreateExportJobMutation,
  useRunReportMutation,
  useCreateImportJobMutation,
  useCreateSupportTicketMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CATALOG_PATH = "/organization/reports-analytics/custom-report-builder";
const RUNS_PATH = "/organization/reports-analytics/scheduled-reports";
const EXPORT_PATH = "/organization/reports-analytics/export-history";
const IMPORT_PATH = "/organization/organization-users/user-management/user-import-history";
const SUPPORT_PATH = "/organization/help-support/my-support-tickets";

const OVERVIEW_REPORTS_PATH = "/organization/reports-analytics/organization-overview-reports";
const RA_INCIDENT_REPORTS_PATH = "/organization/reports-analytics/incident-reports";
const RA_PROBLEM_REPORTS_PATH = "/organization/reports-analytics/problem-reports";
const RA_CHANGE_REPORTS_PATH = "/organization/reports-analytics/change-reports";
const RA_REQUEST_REPORTS_PATH = "/organization/reports-analytics/request-reports";
const RA_SLA_COMPLIANCE_PATH = "/organization/reports-analytics/sla-compliance-reports";
const RA_SLA_BREACH_PATH = "/organization/reports-analytics/sla-breach-reports";
const RA_TEAM_PERFORMANCE_PATH = "/organization/reports-analytics/team-performance";
const RA_CATALOG_USAGE_PATH = "/organization/reports-analytics/service-catalog-usage";
const RA_ARTICLE_PERFORMANCE_PATH = "/organization/reports-analytics/knowledge-article-performance";
const RA_ASSET_REPORTS_PATH = "/organization/reports-analytics/asset-reports";
const RA_RELEASE_REPORTS_PATH = "/organization/reports-analytics/release-reports";
const RA_VENDOR_PERFORMANCE_PATH = "/organization/reports-analytics/vendor-performance-reports";
const RA_AUDIT_REPORTS_PATH = "/organization/reports-analytics/audit-reports";
const PM_REPORTS_PATH = "/organization/problem-management/problem-reports";
const CM_REPORTS_PATH = "/organization/change-management/change-reports";
const RM_REPORTS_PATH = "/organization/request-management/request-reports";
const KM_REPORTS_PATH = "/organization/knowledge-management/knowledge-reports";
const SLA_COMPLIANCE_REPORTS_PATH = "/organization/sla-service-performance/sla-compliance-reports";
const CMDB_ASSET_REPORTS_PATH = "/organization/cmdb-assets/asset-management/asset-reports";
const TEAM_PERFORMANCE_REPORTS_PATH = "/organization/teams-on-call/team-performance-reports";
const RELEASE_REPORTS_PATH = "/organization/release-management/release-reports";
const VENDOR_PERFORMANCE_PATH = "/organization/vendor-management/vendor-performance";
const VENDOR_REPORTS_PATH = "/organization/vendor-management/vendor-reports";
const REPORTING_STRUCTURE_PATH = "/organization/organization-users/organization-structure/reporting-structure";

const catalogColumns: Column<any>[] = [
  { key: "name", header: "Report", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "category", header: "Category", render: (row: any) => row.category },
  statusColumn<any>("status"),
];

const runsColumns: Column<any>[] = [
  { key: "report", header: "Report", render: (row: any) => row.report?.name || "-" },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  { key: "completedAt", header: "Completed", render: (row: any) => row.completedAt ? new Date(row.completedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const exportColumns: Column<any>[] = [
  { key: "id", header: "Export ID", render: (row: any) => row.id },
  { key: "format", header: "Format", render: (row: any) => row.format },
  { key: "records", header: "Records", render: (row: any) => row.recordCount ?? 0 },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const importColumns: Column<any>[] = [
  { key: "id", header: "Import ID", render: (row: any) => row.id },
  { key: "source", header: "Source", render: (row: any) => row.sourceType },
  { key: "records", header: "Records", render: (row: any) => row.totalRecords ?? 0 },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const supportColumns: Column<any>[] = [
  { key: "id", header: "Ticket", render: (row: any) => row.id },
  { key: "subject", header: "Subject", render: (row: any) => row.subject },
  { key: "status", header: "Status", render: (row: any) => row.status },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const reportCatalogColumns: Column<any>[] = [
  { key: "name", header: "Report", render: (row: any) => row.name },
  { key: "key", header: "Key", render: (row: any) => row.key },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
];

function reportCatalogConfig(
  path: string,
  title: string,
  sectionLabel: string,
): ResourceListConfig {
  return {
    path,
    title,
    description: `${title} from the organization report catalog`,
    sectionLabel,
    rowId: "key",
    columns: reportCatalogColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListReportCatalogQuery),
      serverPagination: false,
      extractRows: (p: any) => p?.data ?? [],
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${path}/${row.key}`,
  };
}

export const reportsConfigs: ResourceListConfig[] = [
  {
    path: CATALOG_PATH,
    title: "Report Catalog",
    description: "Available reports and custom report builder",
    sectionLabel: "Reports & Analytics",
    rowId: "id",
    columns: catalogColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListReportCatalogQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${CATALOG_PATH}/${row.id}`,
    create: {
      title: "Create Report",
      description: "Create a new custom report.",
      fields: [
        { key: "name", label: "Report name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "query", label: "Query (JSON)", type: "textarea", required: true },
      ],
      useCreate: asMutationHook(useCreateExportJobMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, query: JSON.parse(values.query as string) }),
      successMessage: "Report created",
    },
  },
  {
    path: RUNS_PATH,
    title: "Scheduled Reports",
    description: "Report execution history and scheduling",
    sectionLabel: "Reports & Analytics",
    rowId: "id",
    columns: runsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListReportRunsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.report?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Ready", value: "READY" },
          { label: "Generating", value: "GENERATING" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Failed", value: "FAILED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${RUNS_PATH}/${row.id}`,
    create: {
      title: "Run Report",
      description: "Execute a report with custom parameters.",
      fields: [
        { key: "reportKey", label: "Report key", type: "text", required: true },
        { key: "limit", label: "Limit", type: "number" },
      ],
      useCreate: asMutationHook(useRunReportMutation),
      buildBody: (values: Record<string, unknown>) => ({ reportKey: values.reportKey, limit: Number(values.limit) || 100 }),
      successMessage: "Report run started",
    },
  },
  {
    path: EXPORT_PATH,
    title: "Export History",
    description: "Data export jobs and history",
    sectionLabel: "Reports & Analytics",
    rowId: "id",
    columns: exportColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListExportJobQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id}`,
    pageSize: 20,
    detailPath: (row: any) => `${EXPORT_PATH}/${row.id}`,
    create: {
      title: "Create Export",
      description: "Create a new data export job.",
      fields: [
        { key: "format", label: "Format", type: "text", required: true },
        { key: "reason", label: "Reason", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateExportJobMutation),
      buildBody: (values: Record<string, unknown>) => ({ format: values.format, reason: values.reason }),
      successMessage: "Export started",
    },
  },
  {
    path: IMPORT_PATH,
    title: "Import Jobs",
    description: "Data import history and status",
    sectionLabel: "Reports & Analytics",
    rowId: "id",
    columns: importColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListImportJobQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.sourceType}`,
    pageSize: 20,
    detailPath: (row: any) => `${IMPORT_PATH}/${row.id}`,
    create: {
      title: "Create Import",
      description: "Start a new data import.",
      fields: [
        { key: "sourceType", label: "Source type", type: "text", required: true },
        { key: "file", label: "File", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateImportJobMutation),
      buildBody: (values: Record<string, unknown>) => ({ sourceType: values.sourceType, file: values.file }),
      successMessage: "Import started",
    },
  },
  {
    path: SUPPORT_PATH,
    title: "My Support Tickets",
    description: "Support tickets submitted to platform",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: supportColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSupportTicketQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.subject}`,
    pageSize: 20,
    detailPath: (row: any) => `${SUPPORT_PATH}/${row.id}`,
    create: {
      title: "Create Support Ticket",
      description: "Submit a new support ticket.",
      fields: [
        { key: "subject", label: "Subject", type: "text", required: true },
        { key: "body", label: "Body", type: "textarea", required: true },
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
      buildBody: (values: Record<string, unknown>) => ({ subject: values.subject, body: values.body }),
      successMessage: "Support ticket created",
    },
  },
  reportCatalogConfig(OVERVIEW_REPORTS_PATH, "Organization Overview Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_INCIDENT_REPORTS_PATH, "Incident Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_PROBLEM_REPORTS_PATH, "Problem Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_CHANGE_REPORTS_PATH, "Change Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_REQUEST_REPORTS_PATH, "Request Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_SLA_COMPLIANCE_PATH, "SLA Compliance Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_SLA_BREACH_PATH, "SLA Breach Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_TEAM_PERFORMANCE_PATH, "Team Performance", "Reports & Analytics"),
  reportCatalogConfig(RA_CATALOG_USAGE_PATH, "Service Catalog Usage", "Reports & Analytics"),
  reportCatalogConfig(RA_ARTICLE_PERFORMANCE_PATH, "Knowledge Article Performance", "Reports & Analytics"),
  reportCatalogConfig(RA_ASSET_REPORTS_PATH, "Asset Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_RELEASE_REPORTS_PATH, "Release Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_VENDOR_PERFORMANCE_PATH, "Vendor Performance Reports", "Reports & Analytics"),
  reportCatalogConfig(RA_AUDIT_REPORTS_PATH, "Audit Reports", "Reports & Analytics"),
  reportCatalogConfig(PM_REPORTS_PATH, "Problem Reports", "Problem Management"),
  reportCatalogConfig(CM_REPORTS_PATH, "Change Reports", "Change Management"),
  reportCatalogConfig(RM_REPORTS_PATH, "Request Reports", "Request Management"),
  reportCatalogConfig(KM_REPORTS_PATH, "Knowledge Reports", "Knowledge Management"),
  reportCatalogConfig(SLA_COMPLIANCE_REPORTS_PATH, "SLA Compliance Reports", "SLA & Service Performance"),
  reportCatalogConfig(CMDB_ASSET_REPORTS_PATH, "Asset Reports", "CMDB & Assets"),
  reportCatalogConfig(TEAM_PERFORMANCE_REPORTS_PATH, "Team Performance Reports", "Teams & On-Call"),
  reportCatalogConfig(RELEASE_REPORTS_PATH, "Release Reports", "Release Management"),
  reportCatalogConfig(VENDOR_PERFORMANCE_PATH, "Vendor Performance", "Vendor Management"),
  reportCatalogConfig(VENDOR_REPORTS_PATH, "Vendor Reports", "Vendor Management"),
  reportCatalogConfig(REPORTING_STRUCTURE_PATH, "Reporting Structure", "Organization & Users"),
  reportCatalogConfig(
    "/organization/incident-management/incident-history-and-reports",
    "Incident History and Reports",
    "Incident Management",
  ),
  reportCatalogConfig(
    "/organization/reports-analytics/cmdb-data-quality",
    "CMDB Data Quality",
    "Reports & Analytics",
  ),
];