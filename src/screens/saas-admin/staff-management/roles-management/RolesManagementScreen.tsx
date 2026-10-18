import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Shield, Trash2, Key } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, StatusBadge, StatCard } from "@/screens/saas-admin/components/ui";
import { Button, ErrorState } from "@components/common/ui";
import { useListRolesQuery, useDeleteRoleMutation } from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

interface Role {
  id: string;
  name: string;
  description: string;
  assignedUsers: number;
  permissionCount: number;
  type: "system" | "custom";
  updatedAt: string | null;
}

function mapRole(row: ApiRecord): Role {
  return {
    id: String(row.id),
    name: String(row.name ?? row.key ?? "Untitled role"),
    description: typeof row.description === "string" ? row.description : "",
    assignedUsers: Number(row.memberCount ?? 0),
    permissionCount: Number(row.permissionCount ?? 0),
    type: row.isSystem ? "system" : "custom",
    updatedAt: row.updatedAt ? String(row.updatedAt) : null,
  };
}

export function RolesManagementScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListRolesQuery({ limit: 100 });
  const [deleteRole] = useDeleteRoleMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const roles = useMemo(() => (data?.data ?? []).map(mapRole), [data]);

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          role.name.toLowerCase().includes(term) ||
          role.description.toLowerCase().includes(term);
        const matchesType = !typeFilter || role.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [roles, searchQuery, typeFilter],
  );

  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));

  const columns = [
    { key: "name", header: "Role Name", render: (row: Role) => <span className="font-medium text-slate-900">{row.name}</span>, sortable: true },
    { key: "description", header: "Description", render: (row: Role) => <span className="text-sm text-slate-700 max-w-xs truncate block">{row.description || "—"}</span> },
    { key: "type", header: "Type", render: (row: Role) => <StatusBadge status={row.type} variant={row.type === "system" ? "default" : "pending"} size="sm" />, sortable: true },
    { key: "assignedUsers", header: "Assigned Users", render: (row: Role) => <span className="text-sm text-slate-700">{row.assignedUsers}</span>, sortable: true },
    { key: "permissionCount", header: "Permissions", render: (row: Role) => <span className="text-sm text-slate-700">{row.permissionCount}</span>, sortable: true },
    { key: "updatedAt", header: "Last Updated", render: (row: Role) => <span className="text-sm text-slate-700">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—"}</span>, sortable: true },
  ];

  const actions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row: Role) => navigate(`/saas-admin/staff-management/roles/${row.id}`) },
    { label: "Edit", icon: <Edit className="h-3.5 w-3.5" />, onClick: (row: Role) => navigate(`/saas-admin/staff-management/roles/edit/${row.id}`) },
    {
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: Role) => row.type === "custom" && row.assignedUsers === 0,
      onClick: (row: Role) => {
        if (window.confirm(`Delete role "${row.name}"?`)) void deleteRole(row.id);
      },
    },
  ];

  return (
    <SaasAdminScreen
      title="Roles Management"
      description="Define roles and permission grants for platform staff."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Roles Management" },
      ]}
      actions={<Button onClick={() => navigate("/saas-admin/staff-management/roles/new")}><Plus className="h-4 w-4 mr-2" /> Create Role</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Roles" value={roles.length} color="info" icon={<Shield className="h-6 w-6" />} />
        <StatCard label="System Roles" value={roles.filter((r) => r.type === "system").length} color="default" icon={<Shield className="h-6 w-6" />} />
        <StatCard label="Custom Roles" value={roles.filter((r) => r.type === "custom").length} color="warning" icon={<Plus className="h-6 w-6" />} />
        <StatCard label="Total Permissions" value={roles.reduce((sum, r) => sum + r.permissionCount, 0)} color="success" icon={<Key className="h-6 w-6" />} />
      </div>

      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search roles..."
        filters={[{ key: "type", label: "Type", type: "select", options: [{ value: "system", label: "System" }, { value: "custom", label: "Custom" }] }]}
        filterValues={{ type: typeFilter }}
        onFilterChange={(key, value) => { if (key === "type") setTypeFilter(value as string); }}
        onClearFilters={() => setTypeFilter("")}
      />

      {isError ? (
        <ErrorState message="Could not load platform roles." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paginatedRoles}
            rowKey={(r) => r.id}
            loading={isLoading}
            onRowClick={(r) => navigate(`/saas-admin/staff-management/roles/${r.id}`)}
            actions={actions}
            emptyTitle="No roles found"
            emptyDescription="Create your first role"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredRoles.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </>
      )}
    </SaasAdminScreen>
  );
}
