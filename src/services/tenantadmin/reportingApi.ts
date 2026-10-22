import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export interface DashboardOverview {
  counts: Record<string, number>;
  recentActivity: { id: string; action: string; createdAt: string }[];
}

export interface DashboardIncidents {
  byStatus: { key: string; count: number }[];
  byPriority: { key: string; count: number }[];
}

export interface DashboardWorkload {
  assignees: { userId: string; name: string; open: number; resolved: number }[];
}

export interface DashboardTrends {
  days: { date: string; created: number; resolved: number }[];
}

export interface ReportCatalogEntry {
  key: string;
  name: string;
  description: string | null;
  group: string | null;
  formats: string[];
}

export interface ReportRun {
  id: string;
  reportKey: string;
  kind: string;
  format: string;
  status: string;
  filters: Record<string, unknown> | null;
  result: unknown;
  error: string | null;
  requestedById: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ExportJob {
  id: string;
  resourceKey: string;
  kind: string;
  format: string;
  status: string;
  fileName: string | null;
  rowCount: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ImportJob {
  id: string;
  resourceType: string;
  format: string;
  fileName: string | null;
  status: string;
  totalRows: number | null;
  processedRows: number | null;
  errorRows: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SupportTicket {
  id: string;
  number: string;
  subject: string;
  description: string;
  priority: string;
  category: string | null;
  status: string;
  createdById: string | null;
  assignedToId: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const REPORT_RUNS_PATH = "/itsm/reports/runs";
export const EXPORTS_PATH = "/itsm/exports";
export const IMPORTS_PATH = "/itsm/imports";
export const SUPPORT_PATH = "/itsm/support";

export const dashboardApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardOverview: build.query<ApiSuccess<DashboardOverview>, void>({
      query: () => ({ url: "/itsm/dashboard/overview" }),
      providesTags: ["Incident"],
    }),
    getDashboardIncidents: build.query<ApiSuccess<DashboardIncidents>, void>({
      query: () => ({ url: "/itsm/dashboard/incidents" }),
      providesTags: ["Incident"],
    }),
    getDashboardWorkload: build.query<ApiSuccess<DashboardWorkload>, void>({
      query: () => ({ url: "/itsm/dashboard/workload" }),
      providesTags: ["Incident"],
    }),
    getDashboardTrends: build.query<ApiSuccess<DashboardTrends>, void>({
      query: () => ({ url: "/itsm/dashboard/trends" }),
      providesTags: ["Incident"],
    }),
    getDashboardActivity: build.query<
      ApiSuccess<DashboardOverview["recentActivity"]>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/dashboard/activity${qs(args ?? {})}` }),
      providesTags: ["AuditEvent"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardIncidentsQuery,
  useGetDashboardWorkloadQuery,
  useGetDashboardTrendsQuery,
  useGetDashboardActivityQuery,
} = dashboardApi;

export const reportsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listReportCatalog: build.query<ApiSuccess<ReportCatalogEntry[]>, void>({
      query: () => ({ url: "/itsm/reports/catalog" }),
      providesTags: ["ReportCatalog"],
    }),
    listReportRuns: build.query<
      ListResponse<ReportRun> & { meta?: PaginationMeta },
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/reports/runs${qs(args ?? {})}` }),
      providesTags: ["ReportRun"],
    }),
    runReport: build.mutation<ApiSuccess<ReportRun>, Record<string, unknown>>({
      query: (body) => ({ url: "/itsm/reports/runs", method: "POST", body }),
      invalidatesTags: ["ReportRun"],
    }),
    getReportRun: build.query<ApiSuccess<ReportRun>, string>({
      query: (runId) => ({ url: resourceUrl(REPORT_RUNS_PATH, runId) }),
      providesTags: ["ReportRun"],
    }),
    cancelReportRun: build.mutation<ApiSuccess<ReportRun>, string>({
      query: (runId) => ({
        url: `${resourceUrl(REPORT_RUNS_PATH, runId)}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["ReportRun"],
    }),
    ...crudEndpoints<ExportJob, "ExportJob">(build, {
      path: EXPORTS_PATH,
      tag: "ExportJob",
    }),
    cancelExportJob: transitionEndpoint<ExportJob, "ExportJob">(
      build,
      EXPORTS_PATH,
      "ExportJob",
      "/cancel",
    ),
  }),
});

export const {
  useListReportCatalogQuery,
  useListReportRunsQuery,
  useRunReportMutation,
  useGetReportRunQuery,
  useCancelReportRunMutation,
  useListExportJobQuery,
  useGetExportJobQuery,
  useCreateExportJobMutation,
  useDeleteExportJobMutation,
  useCancelExportJobMutation,
} = reportsApi;

export const importsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ImportJob, "ImportJob">(build, {
      path: IMPORTS_PATH,
      tag: "ImportJob",
    }),
    runImportJob: transitionEndpoint<ImportJob, "ImportJob">(
      build,
      IMPORTS_PATH,
      "ImportJob",
      "/run",
    ),
    cancelImportJob: transitionEndpoint<ImportJob, "ImportJob">(
      build,
      IMPORTS_PATH,
      "ImportJob",
      "/cancel",
    ),
    retryImportJob: transitionEndpoint<ImportJob, "ImportJob">(
      build,
      IMPORTS_PATH,
      "ImportJob",
      "/retry",
    ),
  }),
});

export const {
  useListImportJobQuery,
  useGetImportJobQuery,
  useCreateImportJobMutation,
  useUpdateImportJobMutation,
  useDeleteImportJobMutation,
  useRunImportJobMutation,
  useCancelImportJobMutation,
  useRetryImportJobMutation,
} = importsApi;

export const supportApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<SupportTicket, "SupportTicket">(build, {
      path: SUPPORT_PATH,
      tag: "SupportTicket",
    }),
    replySupportTicket: transitionEndpoint<SupportTicket, "SupportTicket">(
      build,
      SUPPORT_PATH,
      "SupportTicket",
      "/reply",
    ),
    resolveSupportTicket: transitionEndpoint<SupportTicket, "SupportTicket">(
      build,
      SUPPORT_PATH,
      "SupportTicket",
      "/resolve",
    ),
    closeSupportTicket: transitionEndpoint<SupportTicket, "SupportTicket">(
      build,
      SUPPORT_PATH,
      "SupportTicket",
      "/close",
    ),
    reopenSupportTicket: transitionEndpoint<SupportTicket, "SupportTicket">(
      build,
      SUPPORT_PATH,
      "SupportTicket",
      "/reopen",
    ),
  }),
});

export const {
  useListSupportTicketQuery,
  useGetSupportTicketQuery,
  useCreateSupportTicketMutation,
  useUpdateSupportTicketMutation,
  useDeleteSupportTicketMutation,
  useReplySupportTicketMutation,
  useResolveSupportTicketMutation,
  useCloseSupportTicketMutation,
  useReopenSupportTicketMutation,
} = supportApi;
