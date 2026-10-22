import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListOnCallScheduleQuery,
  useListOnCallShiftQuery,
  useListReleaseQuery,
  useListVendorQuery,
  useListAnnouncementQuery,
  useCreateOnCallScheduleMutation,
  useCreateScheduleShiftMutation,
  useCreateReleaseMutation,
  useCreateVendorMutation,
  useCreateAnnouncementMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const SCHED_PATH = "/organization/teams-on-call/on-call-schedules";
const SHIFT_PATH = "/organization/teams-on-call/on-call-rotations";
const REL_PATH = "/organization/release-management/all-releases";
const VENDOR_PATH = "/organization/vendor-management/all-vendors";
const ANNOUNCE_PATH = "/organization/notifications-communications/organization-announcements";

const schedColumns: Column<any>[] = [
  { key: "name", header: "Schedule", render: (row: any) => row.name },
  { key: "timezone", header: "Timezone", render: (row: any) => row.timezone },
  { key: "rotation", header: "Rotation", render: (row: any) => row.rotationType || "-" },
  statusColumn<any>("status"),
];

const shiftColumns: Column<any>[] = [
  { key: "name", header: "Shift", render: (row: any) => row.name },
  { key: "schedule", header: "Schedule", render: (row: any) => row.schedule?.name || "-" },
  { key: "start", header: "Start", render: (row: any) => row.startTime ? new Date(row.startTime).toLocaleString() : "-" },
  { key: "end", header: "End", render: (row: any) => row.endTime ? new Date(row.endTime).toLocaleString() : "-" },
  { key: "primary", header: "Primary", render: (row: any) => row.primaryUser?.displayName || "-" },
  statusColumn<any>("status"),
];

const releaseColumns: Column<any>[] = [
  { key: "name", header: "Release", render: (row: any) => row.name },
  { key: "version", header: "Version", render: (row: any) => row.version },
  { key: "status", header: "Status", render: (row: any) => row.status },
  { key: "plannedDate", header: "Planned", render: (row: any) => row.plannedDate ? new Date(row.plannedDate).toLocaleDateString() : "-" },
  { key: "releaseManager", header: "Manager", render: (row: any) => row.releaseManager?.displayName || "-" },
];

const vendorColumns: Column<any>[] = [
  { key: "name", header: "Vendor", render: (row: any) => row.name },
  { key: "category", header: "Category", render: (row: any) => row.category || "-" },
  { key: "contact", header: "Primary Contact", render: (row: any) => row.primaryContact?.displayName || "-" },
  { key: "contractValue", header: "Contract Value", render: (row: any) => row.contractValue ? `$${row.contractValue.toLocaleString()}` : "-" },
  statusColumn<any>("status"),
];

const announceColumns: Column<any>[] = [
  { key: "title", header: "Announcement", render: (row: any) => row.title },
  { key: "audience", header: "Audience", render: (row: any) => row.audience || "All" },
  { key: "publishedAt", header: "Published", render: (row: any) => row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

export const operationsConfigs: ResourceListConfig[] = [
  {
    path: SCHED_PATH,
    title: "On-Call Schedules",
    description: "On-call coverage schedules and rotations",
    sectionLabel: "Teams & On-Call",
    rowId: "id",
    columns: schedColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListOnCallScheduleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${SCHED_PATH}/${row.id}`,
    create: {
      title: "Create Schedule",
      description: "Create a new on-call schedule.",
      fields: [
        { key: "name", label: "Schedule name", type: "text", required: true },
        { key: "timezone", label: "Timezone", type: "text", required: true },
        { key: "rotationType", label: "Rotation type", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateOnCallScheduleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, timezone: values.timezone, rotationType: values.rotationType }),
      successMessage: "Schedule created",
    },
  },
  {
    path: SHIFT_PATH,
    title: "On-Call Rotations",
    description: "On-call shift assignments and handover rules",
    sectionLabel: "Teams & On-Call",
    rowId: "id",
    columns: shiftColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListOnCallShiftQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.schedule?.name || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${SHIFT_PATH}/${row.id}`,
    create: {
      title: "Create Shift",
      description: "Create a new on-call shift.",
      fields: [
        { key: "name", label: "Shift name", type: "text", required: true },
        { key: "scheduleId", label: "Schedule ID", type: "text", required: true },
        { key: "primaryUserId", label: "Primary user ID", type: "text", required: true },
        { key: "startTime", label: "Start time", type: "text", required: true },
        { key: "endTime", label: "End time", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateScheduleShiftMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, scheduleId: values.scheduleId, primaryUserId: values.primaryUserId, startTime: values.startTime, endTime: values.endTime }),
      successMessage: "Shift created",
    },
  },
  {
    path: REL_PATH,
    title: "All Releases",
    description: "Release planning, deployment and validation",
    sectionLabel: "Release Management",
    rowId: "id",
    columns: releaseColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListReleaseQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.version}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Planning", value: "PLANNING" },
          { label: "In Deployment", value: "IN_DEPLOYMENT" },
          { label: "Deployed", value: "DEPLOYED" },
          { label: "Rolled Back", value: "ROLLED_BACK" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${REL_PATH}/${row.id}`,
    create: {
      title: "Create Release",
      description: "Create a new release.",
      fields: [
        { key: "name", label: "Release name", type: "text", required: true },
        { key: "version", label: "Version", type: "text", required: true },
        { key: "plannedDate", label: "Planned date", type: "text", required: true },
        { key: "releaseManagerId", label: "Release manager ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateReleaseMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, version: values.version, plannedDate: values.plannedDate, releaseManagerId: values.releaseManagerId }),
      successMessage: "Release created",
    },
  },
  {
    path: VENDOR_PATH,
    title: "All Vendors",
    description: "Vendor contracts, SLAs and performance",
    sectionLabel: "Vendor Management",
    rowId: "id",
    columns: vendorColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListVendorQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.category || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Under Review", value: "UNDER_REVIEW" },
          { label: "Offboarding", value: "OFFBOARDING" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${VENDOR_PATH}/${row.id}`,
    create: {
      title: "Create Vendor",
      description: "Create a new vendor.",
      fields: [
        { key: "name", label: "Vendor name", type: "text", required: true },
        { key: "category", label: "Category", type: "text" },
        { key: "primaryContactId", label: "Primary contact ID", type: "text" },
        { key: "contractValue", label: "Contract value", type: "number" },
      ],
      useCreate: asMutationHook(useCreateVendorMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, category: values.category, primaryContactId: values.primaryContactId, contractValue: Number(values.contractValue) || 0 }),
      successMessage: "Vendor created",
    },
  },
  {
    path: ANNOUNCE_PATH,
    title: "Organization Announcements",
    description: "Organization-wide announcements and communications",
    sectionLabel: "Notifications",
    rowId: "id",
    columns: announceColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAnnouncementQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `${ANNOUNCE_PATH}/${row.id}`,
    create: {
      title: "Create Announcement",
      description: "Create a new organization announcement.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "body", label: "Body", type: "textarea", required: true },
        { key: "audience", label: "Audience", type: "text" },
      ],
      useCreate: asMutationHook(useCreateAnnouncementMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, body: values.body, audience: values.audience }),
      successMessage: "Announcement created",
    },
  },
];