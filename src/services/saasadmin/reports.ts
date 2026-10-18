import { saasadminApi, API_URL } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";
import { TokenStore } from "@services/auth/tokenStore";

/**
 * Reporting and exports — mounted at `/admin/reports`.
 */
export const reportsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    reportCatalog: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/reports/catalog" }),
      providesTags: ["Report"],
    }),
    runReport: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/reports/run", method: "POST", body }),
      invalidatesTags: ["Report"],
    }),
    listReportRuns: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/reports/runs", params: params ?? undefined }),
      providesTags: ["Report"],
    }),
    getReportRun: build.query<ApiSuccess<ApiRecord>, string>({
      query: (runId) => ({ url: `/admin/reports/runs/${encodeURIComponent(runId)}` }),
      providesTags: (_r, _e, runId) => [{ type: "Report", id: runId }],
    }),
    downloadReportRun: build.query<ApiSuccess<ApiRecord>, string>({
      query: (runId) => ({ url: `/admin/reports/runs/${encodeURIComponent(runId)}/download` }),
      providesTags: (_r, _e, runId) => [{ type: "Report", id: runId }],
    }),
    listReportExports: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/reports/exports", params: params ?? undefined }),
      providesTags: ["Report"],
    }),
    createReportExport: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/reports/exports", method: "POST", body }),
      invalidatesTags: ["Report"],
    }),
    getReportExport: build.query<ApiSuccess<ApiRecord>, string>({
      query: (exportId) => ({ url: `/admin/reports/exports/${encodeURIComponent(exportId)}` }),
      providesTags: (_r, _e, exportId) => [{ type: "Report", id: exportId }],
    }),
    deleteReportExport: build.mutation<null, string>({
      query: (exportId) => ({
        url: `/admin/reports/exports/${encodeURIComponent(exportId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Report"],
    }),
    tenantUsageReport: build.query<ApiSuccess<ApiRecord>, ListQuery | void>({
      query: (params) => ({ url: "/admin/reports/tenant-usage", params: params ?? undefined }),
      providesTags: ["Report"],
    }),
    activityReport: build.query<ApiSuccess<ApiRecord>, ListQuery | void>({
      query: (params) => ({ url: "/admin/reports/activity", params: params ?? undefined }),
      providesTags: ["Report"],
    }),
    securitySummaryReport: build.query<ApiSuccess<ApiRecord>, ListQuery | void>({
      query: (params) => ({ url: "/admin/reports/security-summary", params: params ?? undefined }),
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useReportCatalogQuery,
  useRunReportMutation,
  useListReportRunsQuery,
  useGetReportRunQuery,
  useDownloadReportRunQuery,
  useListReportExportsQuery,
  useCreateReportExportMutation,
  useGetReportExportQuery,
  useDeleteReportExportMutation,
  useTenantUsageReportQuery,
  useActivityReportQuery,
  useSecuritySummaryReportQuery,
} = reportsApi;

/**
 * Streams a completed report/export artifact through the authenticated API and
 * saves it as a file. Binary downloads cannot go through RTK Query JSON hooks
 * (they need the bearer token), so this fetches the blob directly.
 */
export async function downloadReportArtifact(runId: string): Promise<void> {
  const token = TokenStore.get();
  const response = await fetch(`${API_URL}/admin/reports/runs/${encodeURIComponent(runId)}/download`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("This export is not ready or has expired. Generate a new export.");
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? `report-${runId}.csv`;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
