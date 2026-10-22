import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListProblemQuery,
  useListProblemCategoryQuery,
  useListRootCauseCategoryQuery,
  useListKnownErrorQuery,
  useCreateProblemMutation,
  useCreateProblemCategoryMutation,
  useCreateRootCauseCategoryMutation,
  useCreateKnownErrorMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const PROB_PATH = "/organization/problem-management/all-problems";
const CAT_PATH = "/organization/problem-management/problem-categories";
const ROOT_PATH = "/organization/problem-management/root-cause-categories";
const KE_PATH = "/organization/problem-management/known-errors";

const probColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  statusColumn<any>("status"),
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const catColumns: Column<any>[] = [
  { key: "name", header: "Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  statusColumn<any>("status"),
];

const rootColumns: Column<any>[] = [
  { key: "name", header: "Root Cause Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  statusColumn<any>("status"),
];

const keColumns: Column<any>[] = [
  { key: "id", header: "ID", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "problem", header: "Problem", render: (row: any) => row.problem?.title || "-" },
  { key: "workaround", header: "Workaround", render: (row: any) => row.workaround ? "Yes" : "No" },
  statusColumn<any>("status"),
];

export const problemsConfigs: ResourceListConfig[] = [
  {
    path: PROB_PATH,
    title: "All Problems",
    description: "Problem records and root cause analysis",
    sectionLabel: "Problem Management",
    rowId: "id",
    columns: probColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListProblemQuery),
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
          { label: "Investigating", value: "INVESTIGATING" },
          { label: "Known Error", value: "KNOWN_ERROR" },
          { label: "Resolved", value: "RESOLVED" },
          { label: "Closed", value: "CLOSED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${PROB_PATH}/${row.id}`,
    create: {
      title: "Create Problem",
      description: "Create a new problem record.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "categoryId", label: "Category ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateProblemMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, categoryId: values.categoryId }),
      successMessage: "Problem created",
    },
  },
  {
    path: CAT_PATH,
    title: "Problem Categories",
    description: "Problem categorization",
    sectionLabel: "Problem Management",
    rowId: "id",
    columns: catColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListProblemCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${CAT_PATH}/${row.id}`,
    create: {
      title: "Create Category",
      description: "Create a new problem category.",
      fields: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateProblemCategoryMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description }),
      successMessage: "Category created",
    },
  },
  {
    path: ROOT_PATH,
    title: "Root Cause Categories",
    description: "Root cause classification",
    sectionLabel: "Problem Management",
    rowId: "id",
    columns: rootColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListRootCauseCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${ROOT_PATH}/${row.id}`,
    create: {
      title: "Create Root Cause Category",
      description: "Create a new root cause category.",
      fields: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateRootCauseCategoryMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description }),
      successMessage: "Category created",
    },
  },
  {
    path: KE_PATH,
    title: "Known Errors",
    description: "Known errors with documented workarounds",
    sectionLabel: "Problem Management",
    rowId: "id",
    columns: keColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnownErrorQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title} ${row.problem?.title || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${KE_PATH}/${row.id}`,
    create: {
      title: "Create Known Error",
      description: "Create a new known error with workaround.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "workaround", label: "Workaround", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateKnownErrorMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, description: values.description, workaround: values.workaround }),
      successMessage: "Known error created",
    },
  },
];