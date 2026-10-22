import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListCatalogCategoryQuery,
  useListCatalogItemQuery,
  useCreateCatalogCategoryMutation,
  useCreateCatalogItemMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CAT_PATH = "/organization/service-catalog/catalog-categories";
const ITEMS_PATH = "/organization/service-catalog/catalog-items";

const catColumns: Column<any>[] = [
  { key: "name", header: "Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "parent", header: "Parent", render: (row: any) => row.parent?.name || "—" },
  statusColumn<any>("status"),
];

const itemColumns: Column<any>[] = [
  { key: "name", header: "Catalog Item", render: (row: any) => row.name },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  { key: "fulfillmentGroup", header: "Fulfillment Group", render: (row: any) => row.fulfillmentGroup?.name || "-" },
  { key: "estimatedTime", header: "Est. Time", render: (row: any) => row.estimatedTime || "-" },
  statusColumn<any>("status"),
];

export const catalogConfigs: ResourceListConfig[] = [
  {
    path: CAT_PATH,
    title: "Catalog Categories",
    description: "Service catalog categorization",
    sectionLabel: "Service Catalog & Knowledge",
    rowId: "id",
    columns: catColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCatalogCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${CAT_PATH}/${row.id}`,
    create: {
      title: "Create Category",
      description: "Create a new catalog category.",
      fields: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "parentId", label: "Parent category ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateCatalogCategoryMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, parentId: values.parentId }),
      successMessage: "Category created",
    },
  },
  {
    path: ITEMS_PATH,
    title: "Catalog Items",
    description: "Published service offerings",
    sectionLabel: "Service Catalog & Knowledge",
    rowId: "id",
    columns: itemColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCatalogItemQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.category?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Published", value: "PUBLISHED" },
          { label: "Draft", value: "DRAFT" },
          { label: "Retired", value: "RETIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${ITEMS_PATH}/${row.id}`,
    create: {
      title: "Create Catalog Item",
      description: "Create a new service catalog item.",
      fields: [
        { key: "name", label: "Item name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "categoryId", label: "Category ID", type: "text", required: true },
        { key: "fulfillmentGroupId", label: "Fulfillment group ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateCatalogItemMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, categoryId: values.categoryId, fulfillmentGroupId: values.fulfillmentGroupId }),
      successMessage: "Catalog item created",
    },
  },
];