import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook } from "@/screens/saas-admin/components/resource/types";
import {
  useGetDashboardOverviewQuery,
  useGetDashboardIncidentsQuery,
  useGetDashboardWorkloadQuery,
  useGetDashboardTrendsQuery,
  useGetDashboardActivityQuery,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const OVERVIEW_PATH = "/organization/dashboard/organization-overview";
const OPERATIONAL_PATH = "/organization/dashboard/operational-summary";
const MY_TASKS_PATH = "/organization/dashboard/my-tasks-and-approvals";
const OPEN_INCIDENTS_PATH = "/organization/dashboard/open-incidents-summary";
const OPEN_REQUESTS_PATH = "/organization/dashboard/open-service-requests";
const SLA_COMPLIANCE_PATH = "/organization/dashboard/sla-compliance-summary";
const OVERDUE_SLAS_PATH = "/organization/dashboard/overdue-and-breached-slas";
const CHANGE_CALENDAR_PATH = "/organization/dashboard/change-calendar";
const PENDING_APPROVALS_PATH = "/organization/dashboard/pending-approvals";
const TEAM_WORKLOAD_PATH = "/organization/dashboard/team-workload";
const ASSET_HEALTH_PATH = "/organization/dashboard/asset-and-cmdb-health";
const RECENT_ACTIVITY_PATH = "/organization/dashboard/recent-organization-activity";
const NOTIFICATIONS_PATH = "/organization/dashboard/notifications-and-alerts";
const SERVICE_AVAILABILITY_PATH = "/organization/dashboard/service-availability-summary";

const overviewColumns: Column<any>[] = [
  { key: "metric", header: "Metric", render: (row: any) => row.metric },
  { key: "value", header: "Value", render: (row: any) => row.value },
  { key: "trend", header: "Trend", render: (row: any) => row.trend },
];

const incidentsColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "priority", header: "Priority", render: (row: any) => row.priority },
  statusColumn<any>("status"),
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
];

const workloadColumns: Column<any>[] = [
  { key: "user", header: "Team Member", render: (row: any) => row.user?.displayName || "-" },
  { key: "openTasks", header: "Open Tasks", render: (row: any) => row.openTasks ?? 0 },
  { key: "openIncidents", header: "Open Incidents", render: (row: any) => row.openIncidents ?? 0 },
  { key: "openRequests", header: "Open Requests", render: (row: any) => row.openRequests ?? 0 },
];

const trendsColumns: Column<any>[] = [
  { key: "period", header: "Period", render: (row: any) => row.period },
  { key: "created", header: "Created", render: (row: any) => row.created ?? 0 },
  { key: "resolved", header: "Resolved", render: (row: any) => row.resolved ?? 0 },
  { key: "slaCompliance", header: "SLA %", render: (row: any) => row.slaCompliance ?? 0 },
];

const activityColumns: Column<any>[] = [
  { key: "timestamp", header: "Time", render: (row: any) => row.timestamp ? new Date(row.timestamp).toLocaleString() : "-" },
  { key: "action", header: "Action", render: (row: any) => row.action },
  { key: "actor", header: "Actor", render: (row: any) => row.actor?.displayName || "-" },
  { key: "target", header: "Target", render: (row: any) => row.target },
];

export const dashboardConfigs: ResourceListConfig[] = [
  {
    path: OVERVIEW_PATH,
    title: "Organization Overview",
    description: "Executive summary of organization health and performance",
    sectionLabel: "Dashboard",
    rowId: "metric",
    columns: overviewColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { metric: "Total Incidents", value: data.incidents?.total ?? 0, trend: data.incidents?.trend },
          { metric: "Open Incidents", value: data.incidents?.open ?? 0, trend: data.incidents?.openTrend },
          { metric: "Total Changes", value: data.changes?.total ?? 0, trend: data.changes?.trend },
          { metric: "Open Changes", value: data.changes?.open ?? 0, trend: data.changes?.openTrend },
          { metric: "Total Requests", value: data.requests?.total ?? 0, trend: data.requests?.trend },
          { metric: "SLA Compliance", value: data.slaCompliance ?? "—", trend: data.slaComplianceTrend },
          { metric: "Active Users", value: data.activeUsers ?? 0, trend: data.activeUsersTrend },
          { metric: "Asset Health", value: data.assetHealth ?? "—", trend: data.assetHealthTrend },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: OPERATIONAL_PATH,
    title: "Operational Summary",
    description: "Operational metrics and key performance indicators",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: incidentsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardIncidentsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: [
        { label: "Open", value: "OPEN" }, { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" }, { label: "Closed", value: "CLOSED" }
      ]},
      { key: "priority", label: "Priority", type: "select", options: [
        { label: "Critical", value: "CRITICAL" }, { label: "High", value: "HIGH" },
        { label: "Medium", value: "MEDIUM" }, { label: "Low", value: "LOW" }
      ]},
    ],
    pageSize: 20,
    detailPath: (row: any) => `/organization/incident-management/all-incidents/${row.id}`,
  },
  {
    path: MY_TASKS_PATH,
    title: "My Tasks & Approvals",
    description: "Personal task queue and pending approvals",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: workloadColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardWorkloadQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.myTasks ?? [],
    },
    pageSize: 20,
  },
  {
    path: OPEN_INCIDENTS_PATH,
    title: "Open Incidents Summary",
    description: "All open incidents across the organization",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: incidentsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardIncidentsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/incident-management/all-incidents/${row.id}`,
  },
  {
    path: OPEN_REQUESTS_PATH,
    title: "Open Service Requests",
    description: "All open service requests",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: incidentsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardIncidentsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data?.requests ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/request-management/all-service-requests/${row.id}`,
  },
  {
    path: SLA_COMPLIANCE_PATH,
    title: "SLA Compliance Summary",
    description: "SLA performance and compliance metrics",
    sectionLabel: "Dashboard",
    rowId: "metric",
    columns: overviewColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data?.sla ?? {};
        return [
          { metric: "Overall Compliance", value: data.compliance ?? "—", trend: data.complianceTrend },
          { metric: "Breached SLAs", value: data.breached ?? 0, trend: data.breachedTrend },
          { metric: "At Risk", value: data.atRisk ?? 0, trend: data.atRiskTrend },
          { metric: "Met", value: data.met ?? 0, trend: data.metTrend },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: OVERDUE_SLAS_PATH,
    title: "Overdue and Breached SLAs",
    description: "SLAs that have breached or are overdue",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: incidentsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardIncidentsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data?.overdueSLAs ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/incident-management/all-incidents/${row.id}`,
  },
  {
    path: CHANGE_CALENDAR_PATH,
    title: "Change Calendar",
    description: "Upcoming changes and maintenance windows",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: [
      { key: "id", header: "ID", render: (row: any) => row.id },
      { key: "title", header: "Title", render: (row: any) => row.title },
      { key: "plannedStart", header: "Planned Start", render: (row: any) => row.plannedStart ? new Date(row.plannedStart).toLocaleString() : "-" },
      { key: "plannedEnd", header: "Planned End", render: (row: any) => row.plannedEnd ? new Date(row.plannedEnd).toLocaleString() : "-" },
      statusColumn<any>("status"),
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.upcomingChanges ?? [],
    },
    pageSize: 20,
    detailPath: (row: any) => `/organization/change-management/all-change-requests/${row.id}`,
  },
  {
    path: PENDING_APPROVALS_PATH,
    title: "Pending Approvals",
    description: "Approvals awaiting your action",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: [
      { key: "id", header: "ID", render: (row: any) => row.id },
      { key: "type", header: "Type", render: (row: any) => row.type },
      { key: "requester", header: "Requester", render: (row: any) => row.requester?.displayName || "-" },
      { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
      statusColumn<any>("status"),
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.pendingApprovals ?? [],
    },
    pageSize: 20,
  },
  {
    path: TEAM_WORKLOAD_PATH,
    title: "Team Workload",
    description: "Team capacity and workload distribution",
    sectionLabel: "Dashboard",
    rowId: "user",
    columns: workloadColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardWorkloadQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.teamWorkload ?? [],
    },
    pageSize: 20,
  },
  {
    path: ASSET_HEALTH_PATH,
    title: "Asset and CMDB Health",
    description: "CMDB data quality and asset health metrics",
    sectionLabel: "Dashboard",
    rowId: "metric",
    columns: overviewColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data?.cmdb ?? {};
        return [
          { metric: "Total CIs", value: data.totalCIs ?? 0, trend: data.totalCIsTrend },
          { metric: "Data Quality", value: data.qualityScore ?? "—", trend: data.qualityScoreTrend },
          { metric: "Stale CIs", value: data.staleCIs ?? 0, trend: data.staleCIsTrend },
          { metric: "Orphaned CIs", value: data.orphanedCIs ?? 0, trend: data.orphanedCIsTrend },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: RECENT_ACTIVITY_PATH,
    title: "Recent Organization Activity",
    description: "Latest activity across the organization",
    sectionLabel: "Dashboard",
    rowId: "timestamp",
    columns: activityColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardActivityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.action} ${row.actor?.displayName || ""}`,
    pageSize: 20,
  },
  {
    path: NOTIFICATIONS_PATH,
    title: "Notifications & Alerts",
    description: "System notifications and alerts",
    sectionLabel: "Dashboard",
    rowId: "id",
    columns: activityColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardActivityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data?.alerts ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.action} ${row.target}`,
    pageSize: 20,
  },
  {
    path: SERVICE_AVAILABILITY_PATH,
    title: "Service Availability Summary",
    description: "Service uptime and availability metrics",
    sectionLabel: "Dashboard",
    rowId: "metric",
    columns: overviewColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetDashboardOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data?.availability ?? {};
        return [
          { metric: "Overall Availability", value: data.overall ?? "—", trend: data.overallTrend },
          { metric: "Critical Services Up", value: data.criticalUp ?? "—", trend: data.criticalUpTrend },
          { metric: "Degraded Services", value: data.degraded ?? 0, trend: data.degradedTrend },
          { metric: "Maintenance Windows", value: data.maintenance ?? 0, trend: data.maintenanceTrend },
        ];
      },
    },
    pageSize: 20,
  },
];

