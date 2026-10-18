import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, PauseCircle, PlayCircle, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, ConfirmDialog, StatusBadge, StatCard } from "@/screens/saas-admin/components/ui";
import type { StatusVariant } from "@/screens/saas-admin/components/ui";
import { ErrorState } from "@components/common/ui";
import {
  useListTenantsQuery,
  useSuspendTenantMutation,
  useReactivateTenantMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

type TenantStatus = "active" | "pending" | "suspended" | "archived" | "failed";

interface StatusRow {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  provisioningStatus: string;
  suspendedAt: string;
  suspendedReason: string;
  archivedAt: string;
  createdAt: string;
}

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "PROVISIONING", label: "Provisioning" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "FAILED", label: "Failed" },
];

const statusVariant: Record<TenantStatus, StatusVariant> = {
  active: "active",
  pending: "pending",
  suspended: "suspended",
  archived: "archived",
  failed: "disabled",
};

function mapStatus(raw: unknown): TenantStatus {
  switch (String(raw ?? "").toUpperCase()) {
    case "ACTIVE": return "active";
    case "SUSPENDED": return "suspended";
    case "ARCHIVED": return "archived";
    case "FAILED": return "failed";
    default: return "pending";
  }
}

function mapRow(row: ApiRecord): StatusRow {
  return {
    id: String(row.id),
    name: String(row.name ?? "Unnamed tenant"),
    slug: String(row.slug ?? ""),
    status: mapStatus(row.status),
    provisioningStatus: String(row.provisioningStatus ?? "NOT_STARTED"),
    suspendedAt: row.suspendedAt ? String(row.suspendedAt) : "",
    suspendedReason: String(row.suspendedReason ?? ""),
    archivedAt: row.archivedAt ? String(row.archivedAt) : "",
    createdAt: row.createdAt ? String(row.createdAt) : "",
  };
}

export function TenantStatusScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListTenantsQuery({ limit: 100 });
  const [suspendTenant] = useSuspendTenantMutation();
  const [reactivateTenant] = useReactivateTenantMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dialog, setDialog] = useState<{ row: StatusRow | null; action: "suspend" | "reactivate" }>({ row: null, action: "suspend" });
  const [dialogBusy, setDialogBusy] = useState(false);

  const rows = useMemo(() => ((data?.data ?? []) as ApiRecord[]).map(mapRow), [data]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          row.name.toLowerCase().includes(term) ||
          row.slug.toLowerCase().includes(term) ||
          row.suspendedReason.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || row.status === mapStatus(statusFilter);
        return matchesSearch && matchesStatus;
      }),
    [rows, searchQuery, statusFilter],
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const columns = [
    {
      key: "name",
      header: "Tenant",
      render: (row: StatusRow) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.slug}</p>
        </div>
      ),
      sortable: true,
    },
    { key: "status", header: "Status", render: (row: StatusRow) => <StatusBadge status={row.status} variant={statusVariant[row.status]} size="sm" />, sortable: true },
    { key: "provisioningStatus", header: "Provisioning", render: (row: StatusRow) => <span className="text-sm text-slate-700">{row.provisioningStatus}</span>, sortable: true },
    { key: "suspendedAt", header: "Suspended At", render: (row: StatusRow) => <span className="text-sm text-slate-700">{row.suspendedAt ? new Date(row.suspendedAt).toLocaleString() : "—"}</span>, sortable: false },
    { key: "suspendedReason", header: "Suspension Reason", render: (row: StatusRow) => <span className="text-sm text-slate-700 max-w-xs truncate block">{row.suspendedReason || "—"}</span>, sortable: false },
    { key: "createdAt", header: "Created", render: (row: StatusRow) => <span className="text-sm text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</span>, sortable: true },
  ];

  const actions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row: StatusRow) => navigate(`/saas-admin/tenants/details/${row.id}`) },
    {
      label: "Suspend",
      icon: <PauseCircle className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: StatusRow) => row.status === "active" || row.status === "pending",
      onClick: (row: StatusRow) => setDialog({ row, action: "suspend" }),
    },
    {
      label: "Reactivate",
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      show: (row: StatusRow) => row.status === "suspended",
      onClick: (row: StatusRow) => setDialog({ row, action: "reactivate" }),
    },
  ];

  const handleConfirm = async () => {
    const row = dialog.row;
    if (!row) return;
    if (dialog.action === "suspend") {
      const reason = window.prompt("Provide a reason for suspending this tenant:", "Suspended from the platform admin console.");
      if (!reason || reason.trim().length < 4) return;
      setDialogBusy(true);
      try {
        await suspendTenant({ tenantId: row.id, body: { reason: reason.trim() } }).unwrap();
        setDialog({ row: null, action: "suspend" });
      } finally {
        setDialogBusy(false);
      }
    } else {
      setDialogBusy(true);
      try {
        await reactivateTenant(row.id).unwrap();
        setDialog({ row: null, action: "suspend" });
      } finally {
        setDialogBusy(false);
      }
    }
  };

  return (
    <SaasAdminScreen
      title="Tenant Status & Suspension"
      description="View tenant lifecycle status and manage suspensions."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management" },
        { label: "Tenant Status" },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Active" value={rows.filter((r) => r.status === "active").length} color="success" icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard label="Suspended" value={rows.filter((r) => r.status === "suspended").length} color="danger" icon={<XCircle className="h-6 w-6" />} />
        <StatCard label="Provisioning" value={rows.filter((r) => r.status === "pending").length} color="warning" icon={<Clock className="h-6 w-6" />} />
        <StatCard label="Archived" value={rows.filter((r) => r.status === "archived").length} color="default" icon={<AlertTriangle className="h-6 w-6" />} />
      </div>

      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={(value) => { setSearchQuery(value); setCurrentPage(1); }}
        placeholder="Search by tenant or suspension reason..."
        filters={[{ key: "status", label: "Status", type: "select", options: statusOptions }]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(key, value) => { if (key === "status") { setStatusFilter(value as string); setCurrentPage(1); } }}
        onClearFilters={() => { setStatusFilter(""); setCurrentPage(1); }}
      />

      {isError ? (
        <ErrorState message="Could not load tenant statuses." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paginated}
            rowKey={(row) => row.id}
            loading={isLoading}
            onRowClick={(row) => navigate(`/saas-admin/tenants/details/${row.id}`)}
            actions={actions}
            emptyTitle="No tenants found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!dialog.row}
        onClose={() => setDialog({ row: null, action: "suspend" })}
        onConfirm={handleConfirm}
        loading={dialogBusy}
        title={dialog.action === "suspend" ? "Suspend Tenant" : "Reactivate Tenant"}
        message={
          dialog.action === "suspend"
            ? `Are you sure you want to suspend "${dialog.row?.name}"? This will block user sign-in and new work creation for this tenant.`
            : `Are you sure you want to reactivate "${dialog.row?.name}"? This will restore tenant capabilities per platform policy.`
        }
        confirmLabel={dialog.action === "suspend" ? "Suspend" : "Reactivate"}
        variant={dialog.action === "suspend" ? "danger" : "info"}
      />
    </SaasAdminScreen>
  );
}
