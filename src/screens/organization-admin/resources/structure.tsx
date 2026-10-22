import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListDepartmentQuery,
  useListLocationQuery,
  useListCostCenterQuery,
  useListTeamQuery,
  useCreateDepartmentMutation,
  useCreateLocationMutation,
  useCreateCostCenterMutation,
  useCreateTeamMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const DEPT_PATH = "/organization/organization-users/organization-structure/departments";
const LOC_PATH = "/organization/organization-users/organization-structure/locations";
const CC_PATH = "/organization/organization-users/organization-structure/cost-centers";
const TEAMS_PATH = "/organization/teams-on-call/all-teams";

const deptColumns: Column<any>[] = [
  { key: "name", header: "Department", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "manager", header: "Manager", render: (row: any) => row.manager?.displayName || "-" },
  statusColumn<any>("status"),
];

const locColumns: Column<any>[] = [
  { key: "name", header: "Location", render: (row: any) => row.name },
  { key: "address", header: "Address", render: (row: any) => row.address || "-" },
  { key: "timezone", header: "Timezone", render: (row: any) => row.timezone || "-" },
  statusColumn<any>("status"),
];

const ccColumns: Column<any>[] = [
  { key: "code", header: "Code", render: (row: any) => row.code },
  { key: "name", header: "Cost Center", render: (row: any) => row.name },
  { key: "owner", header: "Owner", render: (row: any) => row.owner?.displayName || "-" },
  statusColumn<any>("status"),
];

const teamColumns: Column<any>[] = [
  { key: "name", header: "Team", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "lead", header: "Lead", render: (row: any) => row.lead?.displayName || "-" },
  { key: "memberCount", header: "Members", render: (row: any) => row.memberCount ?? 0 },
  statusColumn<any>("status"),
];

export const structureConfigs: ResourceListConfig[] = [
  {
    path: DEPT_PATH,
    title: "Departments",
    description: "Organizational departments and reporting lines",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: deptColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListDepartmentQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${DEPT_PATH}/${row.id}`,
    create: {
      title: "Create Department",
      description: "Create a new department.",
      fields: [
        { key: "name", label: "Department name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "managerId", label: "Manager ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateDepartmentMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, managerId: values.managerId }),
      successMessage: "Department created",
    },
  },
  {
    path: LOC_PATH,
    title: "Locations",
    description: "Offices, sites and regional locations",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: locColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListLocationQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.address || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${LOC_PATH}/${row.id}`,
    create: {
      title: "Create Location",
      description: "Create a new location.",
      fields: [
        { key: "name", label: "Location name", type: "text", required: true },
        { key: "address", label: "Address", type: "textarea" },
        { key: "timezone", label: "Timezone", type: "text" },
      ],
      useCreate: asMutationHook(useCreateLocationMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, address: values.address, timezone: values.timezone }),
      successMessage: "Location created",
    },
  },
  {
    path: CC_PATH,
    title: "Cost Centers",
    description: "Financial cost centers for budgeting",
    sectionLabel: "Organization & Users",
    rowId: "id",
    columns: ccColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCostCenterQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.code} ${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${CC_PATH}/${row.id}`,
    create: {
      title: "Create Cost Center",
      description: "Create a new cost center.",
      fields: [
        { key: "code", label: "Cost center code", type: "text", required: true },
        { key: "name", label: "Cost center name", type: "text", required: true },
        { key: "ownerId", label: "Owner ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateCostCenterMutation),
      buildBody: (values: Record<string, unknown>) => ({ code: values.code, name: values.name, ownerId: values.ownerId }),
      successMessage: "Cost center created",
    },
  },
  {
    path: TEAMS_PATH,
    title: "All Teams",
    description: "Support teams, assignment groups and on-call coverage",
    sectionLabel: "Teams & On-Call",
    rowId: "id",
    columns: teamColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListTeamQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${TEAMS_PATH}/${row.id}`,
    create: {
      title: "Create Team",
      description: "Create a new team.",
      fields: [
        { key: "name", label: "Team name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "leadId", label: "Team lead ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateTeamMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, leadId: values.leadId }),
      successMessage: "Team created",
    },
  },
];