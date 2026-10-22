import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListIncidentQuery,
  useListIncidentCategoryQuery,
  useListIncidentPriorityQuery,
  useListResolutionCodeQuery,
  useListMajorIncidentQuery,
  useCreateIncidentMutation,
  useCreateIncidentCategoryMutation,
  useCreateIncidentPriorityMutation,
  useCreateResolutionCodeMutation,
  useCreateMajorIncidentMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const INCIDENTS_PATH = "/organization/incident-management/all-incidents";
const CAT_PATH = "/organization/incident-management/incident-categories";
const PRI_PATH = "/organization/incident-management/impact-and-urgency-matrix";
const RES_PATH = "/organization/incident-management/incident-resolution-codes";
const MAJOR_PATH = "/organization/incident-management/major-incident-management";

const incidentColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  { key: "priority", header: "Priority", render: (row: any) => row.priority?.name || "-" },
  statusColumn<any>("status"),
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const catColumns: Column<any>[] = [
  { key: "name", header: "Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "parent", header: "Parent", render: (row: any) => row.parent?.name || "—" },
  statusColumn<any>("status"),
];

const priColumns: Column<any>[] = [
  { key: "name", header: "Priority", render: (row: any) => row.name },
  { key: "impact", header: "Impact", render: (row: any) => row.impact },
  { key: "urgency", header: "Urgency", render: (row: any) => row.urgency },
  { key: "responseTime", header: "Response (min)", render: (row: any) => row.responseTime },
  { key: "resolutionTime", header: "Resolution (min)", render: (row: any) => row.resolutionTime },
  statusColumn<any>("status"),
];

const resColumns: Column<any>[] = [
  { key: "code", header: "Code", render: (row: any) => row.code },
  { key: "name", header: "Resolution", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  statusColumn<any>("status"),
];

const majorColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "state", header: "State", render: (row: any) => row.state },
  { key: "impact", header: "Impact", render: (row: any) => row.impact },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
];

export const incidentsConfigs: ResourceListConfig[] = [
  {
    path: INCIDENTS_PATH,
    title: "All Incidents",
    description: "Incident list and operational oversight",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: incidentColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentQuery),
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
          { label: "Open", value: "OPEN" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Resolved", value: "RESOLVED" },
          { label: "Closed", value: "CLOSED" },
        ],
      },
      {
        key: "priority",
        label: "Priority",
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
    detailPath: (row: any) => `${INCIDENTS_PATH}/${row.id}`,
    create: {
      title: "Create Incident",
      description: "Create a new incident.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "categoryId", label: "Category ID", type: "text" },
        { key: "priorityId", label: "Priority ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateIncidentMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, categoryId: values.categoryId, priorityId: values.priorityId }),
      successMessage: "Incident created",
    },
  },
  {
    path: CAT_PATH,
    title: "Incident Categories",
    description: "Incident categorization hierarchy",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: catColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${CAT_PATH}/${row.id}`,
    create: {
      title: "Create Category",
      description: "Create a new incident category.",
      fields: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "parentId", label: "Parent category ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateIncidentCategoryMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, parentId: values.parentId }),
      successMessage: "Category created",
    },
  },
  {
    path: PRI_PATH,
    title: "Impact and Urgency Matrix",
    description: "Priority mapping from impact and urgency",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: priColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentPriorityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${PRI_PATH}/${row.id}`,
    create: {
      title: "Create Priority",
      description: "Create a new priority level.",
      fields: [
        { key: "name", label: "Priority name", type: "text", required: true },
        { key: "impact", label: "Impact", type: "text", required: true },
        { key: "urgency", label: "Urgency", type: "text", required: true },
        { key: "responseTimeMinutes", label: "Response time (min)", type: "number" },
        { key: "resolutionTimeMinutes", label: "Resolution time (min)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateIncidentPriorityMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, impact: values.impact, urgency: values.urgency, responseTimeMinutes: Number(values.responseTimeMinutes) || 0, resolutionTimeMinutes: Number(values.resolutionTimeMinutes) || 0 }),
      successMessage: "Priority created",
    },
  },
  {
    path: RES_PATH,
    title: "Incident Resolution Codes",
    description: "Standard resolution codes for incident closure",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: resColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListResolutionCodeQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.code} ${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${RES_PATH}/${row.id}`,
    create: {
      title: "Create Resolution Code",
      description: "Create a new resolution code.",
      fields: [
        { key: "code", label: "Code", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateResolutionCodeMutation),
      buildBody: (values: Record<string, unknown>) => ({ code: values.code, name: values.name, description: values.description }),
      successMessage: "Resolution code created",
    },
  },
  {
    path: MAJOR_PATH,
    title: "Major Incident Management",
    description: "Major incident tracking and communication",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: majorColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListMajorIncidentQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `${MAJOR_PATH}/${row.id}`,
    create: {
      title: "Create Major Incident",
      description: "Create a new major incident.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "impact", label: "Impact", type: "text" },
      ],
      useCreate: asMutationHook(useCreateMajorIncidentMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, impact: values.impact }),
      successMessage: "Major incident created",
    },
  },
  {
    path: "/organization/incident-management/priority-mapping",
    title: "Priority Mapping",
    description: "Priority mapping from impact and urgency",
    sectionLabel: "Incident Management",
    rowId: "id",
    columns: priColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentPriorityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/incident-management/priority-mapping/${row.id}`,
  },
];