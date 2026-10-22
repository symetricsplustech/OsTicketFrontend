import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListSettingsQuery,
  useListCustomFieldQuery,
  useListPortalFormsQuery,
  useCreateCustomFieldMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const SETTINGS_PATH = "/organization/organization-settings/custom-fields";
const FIELDS_PATH = "/organization/organization-settings/form-configuration";
const PORTAL_PATH = "/organization/organization-settings/organization-portal-configuration";

const settingsColumns: Column<any>[] = [
  { key: "key", header: "Setting", render: (row: any) => row.key },
  { key: "value", header: "Value", render: (row: any) => String(row.value).slice(0, 50) },
  { key: "category", header: "Category", render: (row: any) => row.category },
  statusColumn<any>("status"),
];

const fieldsColumns: Column<any>[] = [
  { key: "label", header: "Field Label", render: (row: any) => row.label },
  { key: "key", header: "Key", render: (row: any) => row.key },
  { key: "type", header: "Type", render: (row: any) => row.fieldType },
  { key: "entity", header: "Entity", render: (row: any) => row.entityType },
  statusColumn<any>("status"),
];

const portalColumns: Column<any>[] = [
  { key: "name", header: "Form", render: (row: any) => row.name },
  { key: "entity", header: "Entity", render: (row: any) => row.entityType },
  { key: "isDefault", header: "Default", render: (row: any) => row.isDefault ? "Yes" : "No" },
  statusColumn<any>("status"),
];

export const settingsConfigs: ResourceListConfig[] = [
  {
    path: SETTINGS_PATH,
    title: "Custom Fields",
    description: "Custom fields for tickets, assets, CIs and more",
    sectionLabel: "Organization Settings",
    rowId: "id",
    columns: fieldsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCustomFieldQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.label} ${row.key}`,
    pageSize: 20,
    detailPath: (row: any) => `${SETTINGS_PATH}/${row.id}`,
    create: {
      title: "Create Custom Field",
      description: "Create a new custom field.",
      fields: [
        { key: "label", label: "Field label", type: "text", required: true },
        { key: "key", label: "Field key", type: "text", required: true },
        { key: "fieldType", label: "Field type", type: "text", required: true },
        { key: "entityType", label: "Entity type", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateCustomFieldMutation),
      buildBody: (values: Record<string, unknown>) => ({ label: values.label, key: values.key, fieldType: values.fieldType, entityType: values.entityType }),
      successMessage: "Custom field created",
    },
  },
  {
    path: FIELDS_PATH,
    title: "Form Configuration",
    description: "Form layouts and field configurations",
    sectionLabel: "Organization Settings",
    rowId: "id",
    columns: portalColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListPortalFormsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.entityType}`,
    pageSize: 20,
    detailPath: (row: any) => `${FIELDS_PATH}/${row.id}`,
    create: {
      title: "Create Form",
      description: "Create a new form configuration.",
      fields: [
        { key: "name", label: "Form name", type: "text", required: true },
        { key: "entityType", label: "Entity type", type: "text", required: true },
        { key: "isDefault", label: "Default form", type: "boolean" },
      ],
      useCreate: asMutationHook(useCreateCustomFieldMutation),
      buildBody: (values: Record<string, unknown>) => ({ label: String(values.name), key: String(values.name).toLowerCase().replace(/\s+/g, "_"), fieldType: "text", entityType: String(values.entityType) }),
      successMessage: "Form created",
    },
  },
  {
    path: PORTAL_PATH,
    title: "Organization Portal Configuration",
    description: "Employee center and portal settings",
    sectionLabel: "Organization Settings",
    rowId: "id",
    columns: settingsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSettingsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.key}`,
    pageSize: 20,
    detailPath: (row: any) => `${PORTAL_PATH}/${row.id}`,
  },
];