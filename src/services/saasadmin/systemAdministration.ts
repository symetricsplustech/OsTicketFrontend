import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * System administration (health, services, queues, jobs, maintenance) —
 * mounted at `/admin/system-administration`.
 */
export const systemAdministrationApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    systemHealth: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/system-administration/health" }),
      providesTags: ["SystemAdministration"],
    }),
    listSystemServices: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/system-administration/services" }),
      providesTags: ["SystemAdministration"],
    }),
    getSystemService: build.query<ApiSuccess<ApiRecord>, string>({
      query: (serviceKey) => ({
        url: `/admin/system-administration/services/${encodeURIComponent(serviceKey)}`,
      }),
      providesTags: (_r, _e, serviceKey) => [
        { type: "SystemAdministration", id: serviceKey },
      ],
    }),
    listSystemQueues: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/system-administration/queues" }),
      providesTags: ["SystemAdministration"],
    }),
    listSystemJobs: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/system-administration/jobs",
        params: params ?? undefined,
      }),
      providesTags: ["SystemAdministration"],
    }),
    getSystemJob: build.query<ApiSuccess<ApiRecord>, string>({
      query: (jobId) => ({
        url: `/admin/system-administration/jobs/${encodeURIComponent(jobId)}`,
      }),
      providesTags: (_r, _e, jobId) => [
        { type: "SystemAdministration", id: jobId },
      ],
    }),
    retrySystemJob: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (jobId) => ({
        url: `/admin/system-administration/jobs/${encodeURIComponent(jobId)}/retry`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, jobId) => [
        "SystemAdministration",
        { type: "SystemAdministration", id: jobId },
      ],
    }),
    cancelSystemJob: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (jobId) => ({
        url: `/admin/system-administration/jobs/${encodeURIComponent(jobId)}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, jobId) => [
        "SystemAdministration",
        { type: "SystemAdministration", id: jobId },
      ],
    }),
    getMaintenance: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/system-administration/maintenance" }),
      providesTags: ["SystemAdministration"],
    }),
    updateMaintenance: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/system-administration/maintenance",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SystemAdministration"],
    }),
    systemDiagnostics: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/system-administration/diagnostics" }),
      providesTags: ["SystemAdministration"],
    }),
    systemVersion: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/system-administration/version" }),
      providesTags: ["SystemAdministration"],
    }),
  }),
});

export const {
  useSystemHealthQuery,
  useListSystemServicesQuery,
  useGetSystemServiceQuery,
  useListSystemQueuesQuery,
  useListSystemJobsQuery,
  useGetSystemJobQuery,
  useRetrySystemJobMutation,
  useCancelSystemJobMutation,
  useGetMaintenanceQuery,
  useUpdateMaintenanceMutation,
  useSystemDiagnosticsQuery,
  useSystemVersionQuery,
} = systemAdministrationApi;
