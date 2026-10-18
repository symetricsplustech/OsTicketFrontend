import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Platform dashboard — mounted at `/admin/dashboard`.
 */
export const dashboardApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    dashboardSummary: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/dashboard/summary" }),
      providesTags: ["Dashboard"],
    }),
    dashboardTenantGrowth: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/dashboard/tenant-growth", params: params ?? undefined }),
      providesTags: ["Dashboard"],
    }),
    dashboardTenantStatus: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/dashboard/tenant-status" }),
      providesTags: ["Dashboard"],
    }),
    dashboardPlatformHealth: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/dashboard/platform-health" }),
      providesTags: ["Dashboard"],
    }),
    dashboardRecentActivity: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/dashboard/recent-activity", params: params ?? undefined }),
      providesTags: ["Dashboard"],
    }),
    dashboardAlerts: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/dashboard/alerts" }),
      providesTags: ["Dashboard"],
    }),
    dashboardWorkQueue: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/dashboard/work-queue", params: params ?? undefined }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useDashboardSummaryQuery,
  useDashboardTenantGrowthQuery,
  useDashboardTenantStatusQuery,
  useDashboardPlatformHealthQuery,
  useDashboardRecentActivityQuery,
  useDashboardAlertsQuery,
  useDashboardWorkQueueQuery,
} = dashboardApi;
