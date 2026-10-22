import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListChangeQuery,
  useListChangeTypeQuery,
  useListChangeTemplateQuery,
  useListChangeWindowQuery,
  useListServiceRequestQuery,
  useCreateChangeMutation,
  useCreateChangeTypeMutation,
  useCreateChangeTemplateMutation,
  useCreateChangeWindowMutation,
  useCreateServiceRequestMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CHANGES_PATH = "/organization/change-management/all-change-requests";
const TYPES_PATH = "/organization/change-management/change-models-and-templates";
const WINDOWS_PATH = "/organization/change-management/change-calendar";
const REQUESTS_PATH = "/organization/request-management/all-service-requests";

const changeColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "type", header: "Type", render: (row: any) => row.type?.name || "-" },
  { key: "risk", header: "Risk", render: (row: any) => row.riskLevel || "-" },
  statusColumn<any>("status"),
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
  { key: "plannedStart", header: "Planned Start", render: (row: any) => row.plannedStart ? new Date(row.plannedStart).toLocaleString() : "-" },
];

const typeColumns: Column<any>[] = [
  { key: "name", header: "Change Type", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "riskLevel", header: "Default Risk", render: (row: any) => row.riskLevel || "-" },
  statusColumn<any>("status"),
];

const templateColumns: Column<any>[] = [
  { key: "name", header: "Template", render: (row: any) => row.name },
  { key: "type", header: "Type", render: (row: any) => row.type?.name || "-" },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  statusColumn<any>("status"),
];

const windowColumns: Column<any>[] = [
  { key: "name", header: "Window", render: (row: any) => row.name },
  { key: "startTime", header: "Start", render: (row: any) => row.startTime ? new Date(row.startTime).toLocaleString() : "-" },
  { key: "endTime", header: "End", render: (row: any) => row.endTime ? new Date(row.endTime).toLocaleString() : "-" },
  { key: "recurrence", header: "Recurrence", render: (row: any) => row.recurrence || "One-time" },
  statusColumn<any>("status"),
];

const requestColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  statusColumn<any>("status"),
  { key: "requester", header: "Requester", render: (row: any) => row.requester?.displayName || "-" },
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

export const changesConfigs: ResourceListConfig[] = [
  {
    path: CHANGES_PATH,
    title: "All Change Requests",
    description: "Change requests and approval workflow",
    sectionLabel: "Change Management",
    rowId: "id",
    columns: changeColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListChangeQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title} ${row.type?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Assessment", value: "ASSESSMENT" },
          { label: "Awaiting Approval", value: "AWAITING_APPROVAL" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Implemented", value: "IMPLEMENTED" },
          { label: "Closed", value: "CLOSED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${CHANGES_PATH}/${row.id}`,
    create: {
      title: "Create Change Request",
      description: "Create a new change request.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "typeId", label: "Change type ID", type: "text", required: true },
        { key: "riskLevel", label: "Risk level", type: "text" },
      ],
      useCreate: asMutationHook(useCreateChangeMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, typeId: values.typeId, riskLevel: values.riskLevel }),
      successMessage: "Change request created",
    },
  },
  {
    path: TYPES_PATH,
    title: "Change Models and Templates",
    description: "Change models, types and risk definitions",
    sectionLabel: "Change Management",
    rowId: "id",
    columns: typeColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListChangeTypeQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${TYPES_PATH}/${row.id}`,
    create: {
      title: "Create Change Type",
      description: "Create a change model with default risk settings.",
      fields: [
        { key: "name", label: "Type name", type: "text", required: true },
        { key: "code", label: "Code", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "riskLevel", label: "Risk level (LOW / MEDIUM / HIGH / CRITICAL)", type: "text" },
        { key: "requiresApproval", label: "Requires approval", type: "boolean" },
      ],
      useCreate: asMutationHook(useCreateChangeTypeMutation),
      buildBody: (values: Record<string, unknown>) => ({
        name: values.name,
        code: values.code,
        description: values.description,
        riskLevel: values.riskLevel || undefined,
        requiresApproval: values.requiresApproval === true,
      }),
      successMessage: "Change type created",
    },
  },
  {
    path: WINDOWS_PATH,
    title: "Change Calendar",
    description: "Maintenance windows and blackout periods",
    sectionLabel: "Change Management",
    rowId: "id",
    columns: windowColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListChangeWindowQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${WINDOWS_PATH}/${row.id}`,
    create: {
      title: "Create Change Window",
      description: "Create a maintenance window or blackout period.",
      fields: [
        { key: "name", label: "Window name", type: "text", required: true },
        { key: "startTime", label: "Start time", type: "text", required: true },
        { key: "endTime", label: "End time", type: "text", required: true },
        { key: "recurrence", label: "Recurrence", type: "text" },
      ],
      useCreate: asMutationHook(useCreateChangeWindowMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, startTime: values.startTime, endTime: values.endTime, recurrence: values.recurrence }),
      successMessage: "Change window created",
    },
  },
  {
    path: REQUESTS_PATH,
    title: "All Service Requests",
    description: "Service request intake and fulfillment",
    sectionLabel: "Request Management",
    rowId: "id",
    columns: requestColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListServiceRequestQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title} ${row.category?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Submitted", value: "SUBMITTED" },
          { label: "Approved", value: "APPROVED" },
          { label: "Fulfilling", value: "FULFILLING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Cancelled", value: "CANCELLED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${REQUESTS_PATH}/${row.id}`,
    create: {
      title: "Create Service Request",
      description: "Create a new service request.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "categoryId", label: "Category ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateServiceRequestMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, categoryId: values.categoryId }),
      successMessage: "Service request created",
    },
  },
];