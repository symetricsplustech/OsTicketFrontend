import type { Column } from "@/screens/saas-admin/components/ui/DataTable";
import { StatusBadge } from "@/screens/saas-admin/components/ui/StatusBadge";
import { VARIANT_FROM_STATUS } from "@/screens/saas-admin/components/resource/types";

export function statusColumn<T extends Record<string, unknown>>(
  accessor: keyof T | string,
  label = "Status",
): Column<T> {
  return {
    key: String(accessor),
    header: label,
    render: (row: any) => {
      const status = String(row[String(accessor)] ?? "");
      return <StatusBadge status={status} variant={VARIANT_FROM_STATUS(status)} />;
    },
  };
}

export const usersColumns: Column<any>[] = [
  { key: "name", header: "Name", render: (row: any) => `${row.firstName || ""} ${row.lastName || ""}`.trim() || row.email },
  { key: "email", header: "Email", render: (row: any) => row.email },
  statusColumn<any>("status"),
  { key: "roles", header: "Roles", render: (row: any) => (row.roles?.length ? row.roles.join(", ") : "-") },
  { key: "lastLoginAt", header: "Last login", render: (row: any) => row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "-" },
];
