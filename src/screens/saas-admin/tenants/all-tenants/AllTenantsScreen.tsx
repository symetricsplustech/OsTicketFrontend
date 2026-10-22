import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Eye,
  Settings,
  PauseCircle,
  PlayCircle,
  Archive,
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import {
  DataTable,
  SearchFilters,
  Pagination,
  ConfirmDialog,
  StatusBadge,
  StatCard,
} from "@/screens/saas-admin/components/ui";
import { Button, ErrorState } from "@components/common/ui";
import { toast } from "react-hot-toast";
import {
  useListTenantsQuery,
  useDashboardTenantStatusQuery,
  useSuspendTenantMutation,
  useReactivateTenantMutation,
  useArchiveTenantMutation,
  apiErrorMessage,
} from "@services/saasadmin";
import type { ApiRecord, PaginationMeta } from "@services/saasadmin";
import type { StatusVariant } from "@/screens/saas-admin/components/ui";

type TenantStatus = "active" | "pending" | "suspended" | "archived" | "failed";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  provisioningStatus: string;
  primaryContactName: string;
  primaryContactEmail: string;
  userCount: number;
  domainCount: number;
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

const provisioningVariant: Record<string, StatusVariant> = {
  COMPLETED: "enabled",
  IN_PROGRESS: "pending",
  FAILED: "disabled",
  NOT_STARTED: "default",
};

function mapStatus(raw: unknown): TenantStatus {
  switch (String(raw ?? "").toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "SUSPENDED":
      return "suspended";
    case "ARCHIVED":
      return "archived";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
}

function mapTenant(row: ApiRecord): Tenant {
  const count = (row._count ?? {}) as ApiRecord;
  return {
    id: String(row.id),
    name: String(row.name ?? "Unnamed tenant"),
    slug: String(row.slug ?? ""),
    status: mapStatus(row.status),
    provisioningStatus: String(row.provisioningStatus ?? "NOT_STARTED"),
    primaryContactName: String(row.primaryContactName ?? ""),
    primaryContactEmail: String(row.primaryContactEmail ?? ""),
    userCount: Number(count.memberships ?? 0),
    domainCount: Number(count.domains ?? 0),
    createdAt: row.createdAt ? String(row.createdAt) : "",
  };
}

type BulkAction = "suspend" | "reactivate" | "archive";

export function AllTenantsScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 10) || 10);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (
    searchParams.get("sortOrder") === "asc" ? "asc" : "desc"
  ) as "asc" | "desc";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const patchParams = (
    patch: Record<string, string | number | undefined>,
    resetPage = false,
  ) => {
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
      if (searchInput !== search)
        patchParams({ q: searchInput.trim() || undefined }, true);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const listArg = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, search, status, sortBy, sortOrder],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useListTenantsQuery(listArg);
  const statusAgg = useDashboardTenantStatusQuery();
  const [suspendTenant] = useSuspendTenantMutation();
  const [reactivateTenant] = useReactivateTenantMutation();
  const [archiveTenant] = useArchiveTenantMutation();

  const tenants = useMemo(
    () => ((data?.data ?? []) as ApiRecord[]).map(mapTenant),
    [data],
  );
  const meta = data?.meta as PaginationMeta | undefined;
  const totalItems = meta?.total ?? tenants.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

  const hasProvisioningOnPage = tenants.some((t) => t.status === "pending");
  useEffect(() => {
    if (!hasProvisioningOnPage) return;
    const id = setInterval(() => refetch(), 10000);
    return () => clearInterval(id);
  }, [hasProvisioningOnPage]);

  const counts = useMemo(() => {
    const byStatus = ((statusAgg.data?.data as ApiRecord | undefined)
      ?.byStatus ?? []) as ApiRecord[];
    const countFor = (key: string) =>
      Number(byStatus.find((row) => String(row.status) === key)?.count ?? 0);
    const active = countFor("ACTIVE");
    const provisioning = countFor("PROVISIONING");
    const suspended = countFor("SUSPENDED");
    const archived = countFor("ARCHIVED");
    const failed = countFor("FAILED");
    return {
      total: active + provisioning + suspended + archived + failed,
      active,
      provisioning,
      suspended,
    };
  }, [statusAgg.data]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{
    tenants: Tenant[];
    action: BulkAction;
  } | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const columns = [
    {
      key: "name",
      header: "Organization",
      render: (row: Tenant) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.slug}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Tenant) => (
        <StatusBadge
          status={row.status}
          variant={statusVariant[row.status]}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: "provisioningStatus",
      header: "Provisioning",
      render: (row: Tenant) => (
        <StatusBadge
          status={row.provisioningStatus}
          variant={provisioningVariant[row.provisioningStatus] ?? "default"}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: "primaryContactName",
      header: "Primary Contact",
      render: (row: Tenant) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {row.primaryContactName || "—"}
          </p>
          {row.primaryContactEmail ? (
            <p className="text-xs text-slate-500">{row.primaryContactEmail}</p>
          ) : null}
        </div>
      ),
      sortable: true,
    },
    {
      key: "userCount",
      header: "Users",
      render: (row: Tenant) => (
        <span className="text-sm text-slate-700">
          {row.userCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "domainCount",
      header: "Domains",
      render: (row: Tenant) => (
        <span className="text-sm text-slate-700">{row.domainCount}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row: Tenant) => (
        <span className="text-sm text-slate-700">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
      sortable: true,
    },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key)
      patchParams(
        { sortBy: key, sortOrder: sortOrder === "asc" ? "desc" : "asc" },
        true,
      );
    else patchParams({ sortBy: key, sortOrder: "asc" }, true);
  };

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row: Tenant) =>
        navigate(`/saas-admin/tenants/details/${row.id}`),
    },
    {
      label: "Configure",
      icon: <Settings className="h-3.5 w-3.5" />,
      onClick: (row: Tenant) =>
        navigate(`/saas-admin/tenants/configuration/${row.id}`),
    },
    {
      label: "Suspend",
      icon: <PauseCircle className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: Tenant) =>
        row.status === "active" || row.status === "pending",
      onClick: (row: Tenant) =>
        setDialog({ tenants: [row], action: "suspend" }),
    },
    {
      label: "Reactivate",
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      show: (row: Tenant) => row.status === "suspended",
      onClick: (row: Tenant) =>
        setDialog({ tenants: [row], action: "reactivate" }),
    },
    {
      label: "Archive",
      icon: <Archive className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: Tenant) => row.status === "suspended",
      onClick: (row: Tenant) =>
        setDialog({ tenants: [row], action: "archive" }),
    },
  ];

  const selectedTenants = useMemo(
    () => tenants.filter((t) => selectedKeys.has(t.id)),
    [tenants, selectedKeys],
  );

  const runBulk = (action: BulkAction) => {
    if (selectedTenants.length === 0) return;
    setDialog({ tenants: selectedTenants, action });
  };

  const handleConfirm = async () => {
    if (!dialog) return;
    setDialogBusy(true);
    let ok = 0;
    let failed = 0;
    for (const tenant of dialog.tenants) {
      try {
        if (dialog.action === "suspend") {
          await suspendTenant({
            tenantId: tenant.id,
            body: { reason: "Suspended from the platform admin console." },
          }).unwrap();
        } else if (dialog.action === "reactivate") {
          await reactivateTenant(tenant.id).unwrap();
        } else {
          await archiveTenant({
            tenantId: tenant.id,
            body: { reason: "Archived from the platform admin console." },
          }).unwrap();
        }
        ok += 1;
      } catch (cause) {
        failed += 1;
        toast.error(`${tenant.name}: ${apiErrorMessage(cause)}`);
      }
    }
    setDialogBusy(false);
    setDialog(null);
    setSelectedKeys(new Set());
    if (ok > 0) toast.success(`${ok} tenant${ok === 1 ? "" : "s"} updated.`);
    if (failed === 0) refetch();
  };

  const dialogCopy: Record<
    BulkAction,
    {
      title: string;
      verb: string;
      message: (n: number) => string;
      variant: "danger" | "info";
    }
  > = {
    suspend: {
      title: "Suspend Tenant",
      verb: "Suspend",
      variant: "danger",
      message: (n) =>
        n === 1
          ? `Are you sure you want to suspend "${dialog?.tenants[0]?.name}"? This will block user sign-in and new work creation.`
          : `Are you sure you want to suspend ${n} tenants? This will block user sign-in and new work creation for each.`,
    },
    reactivate: {
      title: "Reactivate Tenant",
      verb: "Reactivate",
      variant: "info",
      message: (n) =>
        n === 1
          ? `Are you sure you want to reactivate "${dialog?.tenants[0]?.name}"? This will restore tenant capabilities per platform policy.`
          : `Are you sure you want to reactivate ${n} tenants?`,
    },
    archive: {
      title: "Archive Tenant",
      verb: "Archive",
      variant: "danger",
      message: (n) =>
        n === 1
          ? `Archive "${dialog?.tenants[0]?.name}"? Archived tenants are read-only and retain their data per retention policy.`
          : `Archive ${n} tenants? Archived tenants are read-only and retain their data per retention policy.`,
    },
  };

  return (
    <SaasAdminScreen
      title="All Tenants"
      description="Manage organizations registered on the platform."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management" },
        { label: "All Tenants" },
      ]}
      actions={
        <Button onClick={() => navigate("/saas-admin/tenants/create-tenant")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Total Tenants"
          value={counts.total}
          color="info"
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          label="Active"
          value={counts.active}
          color="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          label="Provisioning"
          value={counts.provisioning}
          color="warning"
          icon={<AlertCircle className="h-6 w-6" />}
        />
        <StatCard
          label="Suspended"
          value={counts.suspended}
          color="danger"
          icon={<XCircle className="h-6 w-6" />}
        />
      </div>

      <SearchFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder="Search by name, slug, or primary contact email..."
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: statusOptions,
          },
        ]}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === "status")
            patchParams({ status: (value as string) || undefined }, true);
        }}
        onClearFilters={() => patchParams({ status: undefined }, true)}
      />

      {selectedKeys.size > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-600">{selectedKeys.size} selected</span>
          <Button variant="ghost" onClick={() => runBulk("suspend")}>
            <PauseCircle className="h-4 w-4 mr-1" /> Suspend
          </Button>
          <Button variant="ghost" onClick={() => runBulk("reactivate")}>
            <PlayCircle className="h-4 w-4 mr-1" /> Reactivate
          </Button>
          <Button
            variant="ghost"
            onClick={() => runBulk("archive")}
            className="text-red-600 hover:bg-red-50"
          >
            <Archive className="h-4 w-4 mr-1" /> Archive
          </Button>
          <Button variant="ghost" onClick={() => setSelectedKeys(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      {isError ? (
        <ErrorState message="Could not load tenants." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={tenants}
            rowKey={(row) => row.id}
            onRowClick={(row) =>
              navigate(`/saas-admin/tenants/details/${row.id}`)
            }
            loading={isLoading || isFetching}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selection={{
              selectedKeys,
              onChange: setSelectedKeys,
              getKey: (row) => row.id,
            }}
            actions={actions}
            emptyTitle="No tenants found"
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

      <ConfirmDialog
        isOpen={!!dialog}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={dialogBusy}
        title={dialog ? dialogCopy[dialog.action].title : ""}
        message={
          dialog ? dialogCopy[dialog.action].message(dialog.tenants.length) : ""
        }
        confirmLabel={dialog ? dialogCopy[dialog.action].verb : ""}
        variant={dialog ? dialogCopy[dialog.action].variant : "info"}
      />
    </SaasAdminScreen>
  );
}
