import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListUsersQuery,
  useInviteUserMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useDeactivateUserMutation,
  useListInvitationsQuery,
  useRevokeInvitationMutation,
  useListAuditEventsQuery,
} from "@services/tenantadmin";
import { usersColumns, statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const USERS_PATH = "/organization/organization-users/user-management/all-users";
const INVITES_PATH = "/organization/organization-users/user-lifecycle/pending-invitations";
const ACTIVITY_PATH = "/organization/organization-users/user-management/user-login-and-activity-history";

const inviteColumns: Column<any>[] = [
  { key: "email", header: "Email", render: (row: any) => row.email },
  { key: "name", header: "Name", render: (row: any) => `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || "-" },
  statusColumn<any>("status"),
  { key: "expiresAt", header: "Expires", render: (row: any) => row.expiresAt ? new Date(row.expiresAt).toLocaleString() : "-" },
  { key: "createdAt", header: "Invited", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const activityColumns: Column<any>[] = [
  { key: "action", header: "Action", render: (row: any) => row.action },
  { key: "resourceType", header: "Resource", render: (row: any) => row.resourceType },
  { key: "actor", header: "Actor", render: (row: any) => row.actorEmail || "-" },
  { key: "outcome", header: "Outcome", render: (row: any) => row.outcome },
  { key: "ip", header: "IP", render: (row: any) => row.ipAddress || "-" },
  { key: "createdAt", header: "Time", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

export const usersConfigs: ResourceListConfig[] = [
  {
    path: USERS_PATH,
    title: "All Users",
    description: "Manage employees and access across your organization.",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: usersColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListUsersQuery),
      serverPagination: true,
      extractRows: (payload: any) => payload?.data ?? [],
      extractTotal: (payload: any) => payload?.meta?.total,
    },
    searchable: (row: any) => `${row.firstName} ${row.lastName} ${row.email}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Invited", value: "INVITED" },
          { label: "Suspended", value: "SUSPENDED" },
          { label: "Deactivated", value: "DEACTIVATED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${USERS_PATH}/${row.id}`,
    actions: [
      {
        label: "Activate",
        useAction: asMutationHook(useActivateUserMutation),
        buildArg: (row: any) => row.id,
        show: (row: any) => row.status !== "ACTIVE",
        successMessage: (row: any) => `${row.email} activated`,
      },
      {
        label: "Suspend",
        variant: "danger",
        useAction: asMutationHook(useSuspendUserMutation),
        buildArg: (row: any) => ({ userId: row.id }),
        confirm: (row: any) => `Suspend access for ${row.email}?`,
        show: (row: any) => row.status === "ACTIVE",
        successMessage: (row: any) => `${row.email} suspended`,
      },
      {
        label: "Deactivate",
        variant: "danger",
        useAction: asMutationHook(useDeactivateUserMutation),
        buildArg: (row: any) => ({ userId: row.id }),
        confirm: (row: any) => `Deactivate ${row.email}?`,
        show: (row: any) => row.status !== "DEACTIVATED",
        successMessage: (row: any) => `${row.email} deactivated`,
      },
    ],
    create: {
      title: "Invite User",
      description: "Send an invitation to join your organization.",
      fields: [
        { key: "email", label: "Email", type: "text", required: true },
        { key: "firstName", label: "First name", type: "text", required: true },
        { key: "lastName", label: "Last name", type: "text", required: true },
        {
          key: "roleIds",
          label: "Role IDs (comma-separated)",
          type: "text",
          placeholder: "e.g. role_1,role_2",
        },
      ],
      useCreate: asMutationHook(useInviteUserMutation),
      buildBody: (values: Record<string, unknown>) => ({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        roleIds: typeof values.roleIds === "string" ? values.roleIds.split(",").map(s => s.trim()).filter(Boolean) : [],
      }),
      successMessage: "Invitation sent",
    },
  },
  {
    path: INVITES_PATH,
    title: "Pending Invitations",
    description: "Invitations that have not yet been accepted",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: inviteColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListInvitationsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.email} ${row.firstName} ${row.lastName}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "PENDING" },
          { label: "Accepted", value: "ACCEPTED" },
          { label: "Revoked", value: "REVOKED" },
          { label: "Expired", value: "EXPIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${INVITES_PATH}/${row.id}`,
    actions: [
      {
        label: "Revoke",
        variant: "danger",
        useAction: asMutationHook(useRevokeInvitationMutation),
        buildArg: (row: any) => row.id,
        confirm: (row: any) => `Revoke the invitation for ${row.email}?`,
        show: (row: any) => row.status === "PENDING",
        successMessage: (row: any) => `Invitation revoked for ${row.email}`,
      },
    ],
  },
  {
    path: ACTIVITY_PATH,
    title: "User Login and Activity History",
    description: "Audit trail of user actions and sign-ins",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: activityColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAuditEventsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.action} ${row.actorEmail || ""} ${row.resourceType}`,
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
];
