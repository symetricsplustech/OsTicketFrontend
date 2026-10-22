import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook } from "@/screens/saas-admin/components/resource/types";
import { useListCustomersQuery } from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CUSTOMERS_DIR_PATH = "/organization/customers/customer-directory";

const customersColumns: Column<any>[] = [
  { key: "name", header: "Customer", render: (row: any) => row.name },
  { key: "industry", header: "Industry", render: (row: any) => row.industry },
  statusColumn<any>("status"),
  { key: "email", header: "Primary email", render: (row: any) => row.primaryContactEmail },
  { key: "phone", header: "Primary phone", render: (row: any) => row.primaryContactPhone },
];

export const customersConfigs: ResourceListConfig[] = [
  {
    path: CUSTOMERS_DIR_PATH,
    title: "Customer Directory",
    description: "Manage customers, contacts, sites and portal access",
    sectionLabel: "Customers & Customer Contacts",
    rowId: "id",
    columns: customersColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCustomersQuery),
      serverPagination: true,
      extractRows: (payload: any) => payload?.data ?? [],
      extractTotal: (payload: any) => payload?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.primaryContactEmail || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Prospect", value: "PROSPECT" },
          { label: "Inactive", value: "INACTIVE" },
          { label: "On Hold", value: "ON_HOLD" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `/organization/customers/${row.id}`,
  },
];
