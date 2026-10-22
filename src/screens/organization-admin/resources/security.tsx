import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListAuditEventsQuery,
  useListSecurityEventsQuery,
  useListSecuritySessionsQuery,
  useRevokeSecuritySessionMutation,
  useListAccessPolicyQuery,
  useListDelegationQuery,
  useListAccessReviewQuery,
  useGetSecurityOverviewQuery,
  useCreateAccessPolicyMutation,
  useCreateDelegationMutation,
  useCreateAccessReviewMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const AUDIT_PATH = "/organization/security-audit/organization-audit-logs";
const SEC_EVENTS_PATH = "/organization/security-audit/security-alerts";
const SESSIONS_PATH = "/organization/security-audit/session-management-policies";
const LOGIN_PATH = "/organization/security-audit/login-history";
const ACTIVITY_PATH = "/organization/security-audit/user-activity-logs";
const FAILED_LOGIN_PATH = "/organization/security-audit/failed-login-attempts";
const ACCESS_PATH = "/organization/roles-access-control/access-policies/user-access-policies";
const DELEGATION_PATH = "/organization/roles-access-control/user-assignments/delegated-administration";
const REVIEW_PATH = "/organization/roles-access-control/access-governance/access-review-campaigns";
const OVERVIEW_PATH = "/organization/security-audit/security-overview";

const auditColumns: Column<any>[] = [
  { key: "id", header: "Event ID", render: (row: any) => row.id },
  { key: "action", header: "Action", render: (row: any) => row.action },
  { key: "resourceType", header: "Resource", render: (row: any) => row.resourceType },
  { key: "actor", header: "Actor", render: (row: any) => row.actorEmail },
  { key: "outcome", header: "Outcome", render: (row: any) => row.outcome },
  { key: "createdAt", header: "Time", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const secColumns: Column<any>[] = [
  { key: "id", header: "Alert ID", render: (row: any) => row.id },
  { key: "type", header: "Type", render: (row: any) => row.eventType },
  { key: "severity", header: "Severity", render: (row: any) => row.severity },
  { key: "user", header: "User", render: (row: any) => row.user?.email || "-" },
  { key: "createdAt", header: "Time", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const sessionColumns: Column<any>[] = [
  { key: "id", header: "Session ID", render: (row: any) => row.id },
  { key: "user", header: "User", render: (row: any) => row.user?.email || "-" },
  { key: "ip", header: "IP", render: (row: any) => row.ipAddress },
  { key: "device", header: "Device", render: (row: any) => row.userAgent },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  { key: "expiresAt", header: "Expires", render: (row: any) => row.expiresAt ? new Date(row.expiresAt).toLocaleString() : "-" },
];

const accessColumns: Column<any>[] = [
  { key: "name", header: "Policy", render: (row: any) => row.name },
  { key: "resourceType", header: "Resource", render: (row: any) => row.resourceType },
  { key: "condition", header: "Condition", render: (row: any) => row.condition || "-" },
  statusColumn<any>("status"),
];

const delegationColumns: Column<any>[] = [
  { key: "id", header: "Delegation ID", render: (row: any) => row.id },
  { key: "delegator", header: "Delegator", render: (row: any) => row.delegator?.email || "-" },
  { key: "delegatee", header: "Delegatee", render: (row: any) => row.delegatee?.email || "-" },
  { key: "permission", header: "Permission", render: (row: any) => row.permission },
  { key: "expiresAt", header: "Expires", render: (row: any) => row.expiresAt ? new Date(row.expiresAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const reviewColumns: Column<any>[] = [
  { key: "name", header: "Campaign", render: (row: any) => row.name },
  { key: "scope", header: "Scope", render: (row: any) => row.scope },
  { key: "reviewer", header: "Reviewer", render: (row: any) => row.reviewer?.email || "-" },
  { key: "startDate", header: "Start", render: (row: any) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "-" },
  { key: "endDate", header: "End", render: (row: any) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "-" },
  statusColumn<any>("status"),
];

export const securityConfigs: ResourceListConfig[] = [
  {
    path: AUDIT_PATH,
    title: "Organization Audit Logs",
    description: "Complete audit trail of organization activities",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: auditColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAuditEventsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.action} ${row.actorEmail}`,
    filters: [
      {
        key: "outcome",
        label: "Outcome",
        type: "select",
        options: [
          { label: "Success", value: "SUCCESS" },
          { label: "Failure", value: "FAILURE" },
          { label: "Denied", value: "DENIED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${AUDIT_PATH}/${row.id}`,
  },
  {
    path: SEC_EVENTS_PATH,
    title: "Security Alerts",
    description: "Security events and anomaly detection",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: secColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSecurityEventsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.eventType}`,
    filters: [
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: [
          { label: "Critical", value: "CRITICAL" },
          { label: "High", value: "HIGH" },
          { label: "Medium", value: "MEDIUM" },
          { label: "Low", value: "LOW" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${SEC_EVENTS_PATH}/${row.id}`,
  },
  {
    path: SESSIONS_PATH,
    title: "Session Management Policies",
    description: "Active sessions and session policies",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: sessionColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSecuritySessionsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.user?.email || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${SESSIONS_PATH}/${row.id}`,
  },
  {
    path: LOGIN_PATH,
    title: "Login History",
    description: "User sign-ins across the organization",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: sessionColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSecuritySessionsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.user?.email || ""} ${row.ipAddress || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${LOGIN_PATH}/${row.id}`,
    actions: [
      {
        label: "Revoke Session",
        variant: "danger",
        useAction: asMutationHook(useRevokeSecuritySessionMutation),
        buildArg: (row: any) => row.id,
        confirm: (row: any) => `Revoke the session for ${row.user?.email ?? "this user"}?`,
        successMessage: () => "Session revoked",
        show: (row: any) => !row.revokedAt,
      },
    ],
  },
  {
    path: ACTIVITY_PATH,
    title: "User Activity Logs",
    description: "Audit trail of user actions",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: auditColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAuditEventsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.action} ${row.actorEmail}`,
    filters: [
      {
        key: "outcome",
        label: "Outcome",
        type: "select",
        options: [
          { label: "Success", value: "SUCCESS" },
          { label: "Failure", value: "FAILURE" },
          { label: "Denied", value: "DENIED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${ACTIVITY_PATH}/${row.id}`,
  },
  {
    path: FAILED_LOGIN_PATH,
    title: "Failed Login Attempts",
    description: "Denied and failed sign-in attempts",
    sectionLabel: "Security & Audit",
    rowId: "id",
    columns: secColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSecurityEventsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
      buildParams: (state: any) => ({
        search: state.search.trim() || undefined,
        page: state.page,
        limit: state.pageSize,
        eventType: "auth.access.denied",
      }),
    },
    searchable: (row: any) => `${row.id} ${row.eventType}`,
    filters: [
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: [
          { label: "Critical", value: "CRITICAL" },
          { label: "High", value: "HIGH" },
          { label: "Medium", value: "MEDIUM" },
          { label: "Low", value: "LOW" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${FAILED_LOGIN_PATH}/${row.id}`,
  },
  {
    path: ACCESS_PATH,
    title: "User Access Policies",
    description: "Record-level and field-level access rules",
    sectionLabel: "Roles & Access Control",
    rowId: "id",
    columns: accessColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAccessPolicyQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.resourceType}`,
    pageSize: 20,
    detailPath: (row: any) => `${ACCESS_PATH}/${row.id}`,
    create: {
      title: "Create Access Policy",
      description: "Create a new access policy.",
      fields: [
        { key: "name", label: "Policy name", type: "text", required: true },
        { key: "resourceType", label: "Resource type", type: "text", required: true },
        { key: "condition", label: "Condition", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateAccessPolicyMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, resourceType: values.resourceType, condition: values.condition }),
      successMessage: "Access policy created",
    },
  },
  {
    path: DELEGATION_PATH,
    title: "Delegated Administration",
    description: "Temporary and delegated access grants",
    sectionLabel: "Roles & Access Control",
    rowId: "id",
    columns: delegationColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListDelegationQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.delegator?.email || ""} ${row.delegatee?.email || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${DELEGATION_PATH}/${row.id}`,
    create: {
      title: "Create Delegation",
      description: "Create a new delegation.",
      fields: [
        { key: "delegatorId", label: "Delegator ID", type: "text", required: true },
        { key: "delegateeId", label: "Delegatee ID", type: "text", required: true },
        { key: "permission", label: "Permission", type: "text", required: true },
        { key: "expiresAt", label: "Expires at", type: "text" },
      ],
      useCreate: asMutationHook(useCreateDelegationMutation),
      buildBody: (values: Record<string, unknown>) => ({ delegatorId: values.delegatorId, delegateeId: values.delegateeId, permission: values.permission, expiresAt: values.expiresAt }),
      successMessage: "Delegation created",
    },
  },
  {
    path: REVIEW_PATH,
    title: "Access Review Campaigns",
    description: "Periodic access certification campaigns",
    sectionLabel: "Roles & Access Control",
    rowId: "id",
    columns: reviewColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAccessReviewQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Planned", value: "PLANNED" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Cancelled", value: "CANCELLED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${REVIEW_PATH}/${row.id}`,
    create: {
      title: "Create Access Review",
      description: "Create a new access review campaign.",
      fields: [
        { key: "name", label: "Campaign name", type: "text", required: true },
        { key: "scope", label: "Scope", type: "text", required: true },
        { key: "reviewerId", label: "Reviewer ID", type: "text", required: true },
        { key: "startDate", label: "Start date", type: "text", required: true },
        { key: "endDate", label: "End date", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateAccessReviewMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, scope: values.scope, reviewerId: values.reviewerId, startDate: values.startDate, endDate: values.endDate }),
      successMessage: "Access review created",
    },
  },
  {
    path: OVERVIEW_PATH,
    title: "Security Overview",
    description: "Sessions, MFA adoption and security events by severity",
    sectionLabel: "Security & Audit",
    rowId: "metric",
    columns: [
      { key: "metric", header: "Metric", render: (row: any) => row.metric },
      { key: "value", header: "Value", render: (row: any) => row.value },
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetSecurityOverviewQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        const rows = [
          { metric: "Active Sessions", value: data.activeSessions ?? 0 },
          {
            metric: "MFA Adoption",
            value: `${data.mfaAdoption?.enrolled ?? 0} / ${data.mfaAdoption?.total ?? 0}`,
          },
        ];
        for (const [severity, count] of Object.entries(
          (data.eventSeverity ?? {}) as Record<string, number>,
        )) {
          rows.push({ metric: `Security Events — ${severity}`, value: count });
        }
        return rows;
      },
    },
    pageSize: 20,
  },
];
