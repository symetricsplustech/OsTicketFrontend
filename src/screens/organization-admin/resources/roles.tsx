import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListRolesQuery,
  useCreateRoleMutation,
  useGetPermissionCatalogQuery,
  useListTenantPermissionsQuery,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const ROLES_PATH = "/organization/roles-access-control/roles/all-roles";
const PERMS_PATH = "/organization/roles-access-control/permissions/permission-catalog";

const rolesColumns: Column<any>[] = [
  { key: "name", header: "Role", render: (row: any) => row.name },
  { key: "key", header: "Key", render: (row: any) => row.key },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "memberCount", header: "Members", render: (row: any) => row.memberCount ?? 0 },
  statusColumn<any>("status"),
];

const permColumns: Column<any>[] = [
  { key: "code", header: "Code", render: (row: any) => row.code },
  { key: "name", header: "Permission", render: (row: any) => row.name },
  { key: "group", header: "Group", render: (row: any) => row.group || "-" },
  { key: "scope", header: "Scope", render: (row: any) => row.scope },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
];

export const rolesConfigs: ResourceListConfig[] = [
  {
    path: ROLES_PATH,
    title: "All Roles",
    description: "Tenant-scoped roles and permissions",
    sectionLabel: "Roles & Access Control",
    rowId: "id",
    columns: rolesColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListRolesQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.key} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${ROLES_PATH}/${row.id}`,
    create: {
      title: "Create Role",
      description: "Create a new role.",
      fields: [
        { key: "name", label: "Role name", type: "text", required: true },
        { key: "key", label: "Role key", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateRoleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, key: values.key, description: values.description }),
      successMessage: "Role created",
    },
  },
  {
    path: PERMS_PATH,
    title: "Permission Catalog",
    description: "All permissions available to roles in this organization",
    sectionLabel: "Roles & Access Control",
    rowId: "id",
    columns: permColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetPermissionCatalogQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.code} ${row.name} ${row.group || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${PERMS_PATH}/${row.id}`,
  },
  ...[
    {
      path: "/organization/roles-access-control/permissions/module-permissions",
      title: "Module Permissions",
      description: "Permissions grouped by application module",
    },
    {
      path: "/organization/roles-access-control/permissions/read-create-update-delete-permissions",
      title: "Read / Create / Update / Delete Permissions",
      description: "CRUD permissions available to roles",
    },
    {
      path: "/organization/roles-access-control/permissions/export-and-import-permissions",
      title: "Export and Import Permissions",
      description: "Permissions controlling data export and import",
    },
    {
      path: "/organization/roles-access-control/permissions/administrative-permissions",
      title: "Administrative Permissions",
      description: "Administrative and privileged permissions",
    },
  ].map(
    (entry): ResourceListConfig => ({
      path: entry.path,
      title: entry.title,
      description: entry.description,
      sectionLabel: "Roles & Access Control",
      rowId: "id",
      columns: permColumns,
      source: {
        kind: "api",
        useList: asQueryHook(useListTenantPermissionsQuery),
        serverPagination: true,
        extractRows: (p: any) => p?.data ?? [],
        extractTotal: (p: any) => p?.meta?.total,
      },
      searchable: (row: any) => `${row.code} ${row.name} ${row.group || ""}`,
      pageSize: 20,
    }),
  ),
];
