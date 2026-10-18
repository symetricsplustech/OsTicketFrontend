import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import { Plus, Eye, Edit, Shield, UserX, UserCheck, Clock, Activity, Users, CheckCircle, ShieldCheck } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, ConfirmDialog, StatusBadge, StatCard } from "@/screens/saas-admin/components/ui";
import { Button, ErrorState } from "@components/common/ui";
import { cn } from "@utils/cn";
import {
  useListStaffQuery,
  useSuspendStaffMutation,
  useActivateStaffMutation,
  useRevokeStaffSessionsMutation,
  apiErrorMessage,
} from "@services/saasadmin";
import type { ApiRecord, PaginationMeta } from "@services/saasadmin";
import type { StatusVariant } from "@/screens/saas-admin/components/ui";

interface Staff {
  id: string;
  name: string;
  email: string;
  roles: string[];
  jobTitle: string;
  status: "active" | "invited" | "suspended" | "disabled";
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INVITED", label: "Invited" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const statusVariant: Record<Staff["status"], StatusVariant> = {
  active: "active",
  invited: "pending",
  suspended: "suspended",
  disabled: "disabled",
};

function mapStatus(raw: unknown): Staff["status"] {
  const value = String(raw ?? "").toUpperCase();
  if (value === "ACTIVE") return "active";
  if (value === "INVITED") return "invited";
  if (value === "SUSPENDED") return "suspended";
  return "disabled";
}

function mapStaff(row: ApiRecord): Staff {
  const roles = Array.isArray(row.roles)
    ? (row.roles as ApiRecord[]).map((role) => String(role.name ?? role.key ?? "")).filter(Boolean)
    : [];
  const name =
    (typeof row.displayName === "string" && row.displayName) ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    String(row.email ?? "Unknown");
  return {
    id: String(row.id),
    name,
    email: String(row.email ?? ""),
    roles,
    jobTitle: typeof row.jobTitle === "string" ? row.jobTitle : "",
    status: mapStatus(row.status),
    mfaEnabled: Boolean(row.mfaEnabled),
    lastLoginAt: row.lastLoginAt ? String(row.lastLoginAt) : null,
    createdAt: row.createdAt ? String(row.createdAt) : null,
  };
}

type PendingAction = { member: Staff; action: "suspend" | "revoke" };

export function StaffAccountsScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 10) || 10);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") === "asc" ? "asc" : "desc") as "asc" | "desc";

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const patchParams = (patch: Record<string, string | number | undefined>, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    if (resetPage) next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== search) patchParams({ q: searchInput.trim() || undefined }, true);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const listArg = useMemo(
    () => ({ page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder }),
    [page, limit, search, status, sortBy, sortOrder],
  );

  const { data, isLoading, isFetching, isError, refetch } = useListStaffQuery(listArg);
  const totalQuery = useListStaffQuery({ limit: 1 });
  const activeQuery = useListStaffQuery({ limit: 1, status: "ACTIVE" });
  const invitedQuery = useListStaffQuery({ limit: 1, status: "INVITED" });
  const suspendedQuery = useListStaffQuery({ limit: 1, status: "SUSPENDED" });

  const [suspendStaff] = useSuspendStaffMutation();
  const [activateStaff] = useActivateStaffMutation();
  const [revokeSessions] = useRevokeStaffSessionsMutation();

  const staff = useMemo(() => ((data?.data ?? []) as ApiRecord[]).map(mapStaff), [data]);
  const meta = data?.meta as PaginationMeta | undefined;
  const totalItems = meta?.total ?? staff.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

  const countFrom = (query: { data?: { meta?: PaginationMeta | Record<string, unknown> } }) =>
    Number((query.data?.meta as PaginationMeta | undefined)?.total ?? 0);
  const counts = {
    total: countFrom(totalQuery),
    active: countFrom(activeQuery),
    invited: countFrom(invitedQuery),
    suspended: countFrom(suspendedQuery),
  };

  const mfaEnabledOnPage = staff.filter((s) => s.mfaEnabled).length;

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const columns = [
    {
      key: "firstName",
      header: "Name",
      render: (row: Staff) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: "roles",
      header: "Roles",
      render: (row: Staff) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length > 0 ? (
            row.roles.map((r) => (
              <span key={r} className="px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded">{r}</span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No roles</span>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      key: "jobTitle",
      header: "Job Title",
      render: (row: Staff) => <span className="text-sm text-slate-700">{row.jobTitle || "—"}</span>,
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Staff) => <StatusBadge status={row.status} variant={statusVariant[row.status]} size="sm" />,
      sortable: true,
    },
    {
      key: "mfaEnabled",
      header: "MFA",
      render: (row: Staff) => (
        <span className={cn("inline-flex items-center gap-1 text-xs", row.mfaEnabled ? "text-emerald-600" : "text-slate-400")}>
          <ShieldCheck className="h-3 w-3" />
          {row.mfaEnabled ? "Enabled" : "Disabled"}
        </span>
      ),
      sortable: false,
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      render: (row: Staff) => (
        <span className="text-sm text-slate-700">{row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "Never"}</span>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row: Staff) => (
        <span className="text-sm text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</span>
      ),
      sortable: true,
    },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key) patchParams({ sortBy: key, sortOrder: sortOrder === "asc" ? "desc" : "asc" }, true);
    else patchParams({ sortBy: key, sortOrder: "asc" }, true);
  };

  const actions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(SAAS_ADMIN_PATHS.staff.account(row.id)) },
    { label: "Edit", icon: <Edit className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(SAAS_ADMIN_PATHS.staff.edit(row.id)) },
    { label: "Roles", icon: <Shield className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(SAAS_ADMIN_PATHS.staff.edit(row.id)) },
    {
      label: "Disable",
      icon: <UserX className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: Staff) => row.status === "active",
      onClick: (row: Staff) => setPending({ member: row, action: "suspend" }),
    },
    { label: "Enable", icon: <UserCheck className="h-3.5 w-3.5" />, show: (row: Staff) => row.status === "disabled" || row.status === "suspended", onClick: (row: Staff) => void activateStaff(row.id).unwrap().then(() => { toast.success("Staff member activated."); refetch(); }).catch((e) => toast.error(apiErrorMessage(e))) },
    {
      label: "Revoke Sessions",
      icon: <Clock className="h-3.5 w-3.5" />,
      variant: "ghost" as const,
      show: (row: Staff) => row.status === "active",
      onClick: (row: Staff) => setPending({ member: row, action: "revoke" }),
    },
    { label: "Activity", icon: <Activity className="h-3.5 w-3.5" />, variant: "ghost" as const, onClick: (row: Staff) => navigate(`${SAAS_ADMIN_PATHS.staff.auditLogs}?staffId=${row.id}`) },
  ];

  const handleConfirm = async () => {
    if (!pending) return;
    setDialogBusy(true);
    try {
      if (pending.action === "suspend") {
        await suspendStaff(pending.member.id).unwrap();
        toast.success("Staff member disabled.");
      } else {
        await revokeSessions(pending.member.id).unwrap();
        toast.success("Sessions revoked.");
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setDialogBusy(false);
      setPending(null);
    }
  };

  return (
    <SaasAdminScreen
      title="Staff Accounts"
      description="Manage platform staff accounts and their access."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Staff Accounts" },
      ]}
      actions={
        <Button onClick={() => navigate(SAAS_ADMIN_PATHS.staff.create)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Staff Account
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Staff" value={counts.total} color="info" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Active" value={counts.active} color="success" icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard label="Invited" value={counts.invited} color="warning" icon={<Clock className="h-6 w-6" />} />
        <StatCard label="Suspended" value={counts.suspended} color="danger" icon={<Shield className="h-6 w-6" />} />
      </div>

      <SearchFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder="Search by name or email..."
        filters={[
          { key: "status", label: "Status", type: "select", options: statusOptions },
        ]}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === "status") patchParams({ status: (value as string) || undefined }, true);
        }}
        onClearFilters={() => patchParams({ status: undefined }, true)}
      />

      {isError ? (
        <ErrorState message="Could not load staff accounts." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={staff}
            rowKey={(row) => row.id}
            loading={isLoading || isFetching}
            onRowClick={(row) => navigate(SAAS_ADMIN_PATHS.staff.account(row.id))}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            actions={actions}
            emptyTitle="No staff found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={(next) => patchParams({ page: next })}
            onItemsPerPageChange={(size) => patchParams({ limit: size }, true)}
          />
        </>
      )}

      <p className="mt-3 text-xs text-slate-500">
        {mfaEnabledOnPage} of {staff.length} accounts on this page have MFA enabled.
      </p>

      <ConfirmDialog
        isOpen={!!pending}
        onClose={() => setPending(null)}
        onConfirm={handleConfirm}
        loading={dialogBusy}
        title={pending?.action === "revoke" ? "Revoke Sessions" : "Disable Staff Account"}
        message={
          pending?.action === "revoke"
            ? `Revoke all active sessions for ${pending?.member.name}? They will be signed out on every device.`
            : `Disable ${pending?.member.name}? The account will lose access and all sessions will be revoked.`
        }
        confirmLabel={pending?.action === "revoke" ? "Revoke" : "Disable"}
        variant="danger"
      />
    </SaasAdminScreen>
  );
}
