# SaaS Admin Screens — Complete Detailed Inventory

Generated: exhaustive listing of every screen under /saas-admin/* including nested routed pages, tabs, sections, elements, data, and details shown.

---
## 1) Shell & Routing

### 1.1 SaasAdminSurface (Shell)
- Route root: `/saas-admin` (children via `<Outlet />`)
- Component: `src/screens/saas-admin/SaasAdminSurface.tsx`
```tsx
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, SearchX } from "lucide-react";
import { SaasAdminSidebar } from "@/screens/sidebar/SaasAdminSidebar";
import { Unauthorized } from "@app/layouts/Unauthorized";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import {
  canAccessSaasAdmin,
  canViewSaasAdminItem,
  SAAS_ADMIN_NAVIGATION,
  type SaasAdminNavigationSection,
  type SaasAdminNavigationItem,
} from "@/navigation/saasAdminNavigation.tsx";

interface FlatItem {
  section: SaasAdminNavigationSection;
  item: SaasAdminNavigationItem;
}

function NotAvailable({ item }: { item: SaasAdminNavigationItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Access restricted</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Your permissions do not include <span className="font-medium text-slate-700">{item.label}</span>.
        Use the navigation to reach a capability you are entitled to.
      </p>
    </section>
  );
}

function navPathMatches(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[A-Za-z]+/g, "[^/]+");
  return new RegExp(`^${escaped}(/.*)?$`).test(pathname);
}

export function SaasAdminSurface() {
  const location = useLocation();
  const permissions = useAppSelector(selectPermissions);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const flat = useMemo<FlatItem[]>(
    () => SAAS_ADMIN_NAVIGATION.flatMap((section) => section.items.map((item) => ({ section, item }))),
    [],
  );

  const hasAccess = useMemo(() => canAccessSaasAdmin(permissions), [permissions]);

  const current = useMemo<FlatItem | null>(() => {
    if (!hasAccess) return null;
    const match = flat.find((entry) => navPathMatches(entry.item.path, location.pathname));
    if (match) return match;
    const firstSection = SAAS_ADMIN_NAVIGATION[0];
    if (!firstSection?.items[0]) return null;
    return { section: firstSection, item: firstSection.items[0] };
  }, [flat, location.pathname, hasAccess]);

  const canViewCurrent = current ? canViewSaasAdminItem(permissions, current.section, current.item) : false;

  if (!hasAccess || !current) {
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#saas-admin-content"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <SaasAdminSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 text-sm text-slate-500">
                <li className="truncate">SaaS Admin</li>
                <li className="truncate text-slate-300">/</li>
                <li className="truncate font-medium text-slate-800">{current?.item.label ?? "Dashboard"}</li>
              </ol>
            </nav>
          </div>
        </header>

        <main id="saas-admin-content" className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
          {canViewCurrent ? <Outlet /> : <NotAvailable item={current.item} />}
        </main>
      </div>
    </div>
  );
}
```

### 1.2 saasAdminRoutes (Route Tree)
- Component: `src/screens/saas-admin/saasAdminRoutes.tsx`
import type { RouteObject } from "react-router-dom";
import { SAAS_ADMIN_BASE_PATH } from "@/navigation/saasAdminNavigation";
import { SaasAdminSurface } from "./SaasAdminSurface";
import { DashboardOverviewScreen } from "./dashboard/OverviewScreen";
import { AllTenantsScreen } from "./tenants/all-tenants/AllTenantsScreen";
import { CreateTenantScreen } from "./tenants/create-tenant/CreateTenantScreen";
import { TenantDetailsScreen } from "./tenants/tenant-details/TenantDetailsScreen";
import { TenantConfigurationScreen } from "./tenants/tenant-configuration/TenantConfigurationScreen";
import { TenantStatusScreen } from "./tenants/tenant-status/TenantStatusScreen";
import { StaffAccountsScreen } from "./staff-management/staff-accounts/StaffAccountsScreen";
import { StaffDetailsScreen } from "./staff-management/staff-accounts/StaffDetailsScreen";
import { StaffEditScreen } from "./staff-management/edit/StaffEditScreen";
import { CreateStaffScreen } from "./staff-management/create-staff/CreateStaffScreen";
import { RolesManagementScreen } from "./staff-management/roles-management/RolesManagementScreen";
import { RoleDetailsScreen } from "./staff-management/roles-management/RoleDetailsScreen";
import { RoleFormScreen } from "./staff-management/roles-management/RoleFormScreen";
import { PermissionsManagementScreen } from "./staff-management/permissions-management/PermissionsManagementScreen";
import { RoleAssignmentScreen } from "./staff-management/role-assignment/RoleAssignmentScreen";
import { AccessAuditLogsScreen } from "./staff-management/access-audit-logs/AccessAuditLogsScreen";
import { ResourceListScreen } from "./components/resource/ResourceListScreen";
import { ConfigPanelScreen } from "./components/resource/ConfigPanelScreen";
import { ChangePasswordScreen } from "./resources/ChangePasswordScreen";
import { RESOURCE_LISTS, RESOURCE_PANELS, relativePath } from "./resources";

export const SAAS_ADMIN_ROUTES: RouteObject[] = [
  {
    path: SAAS_ADMIN_BASE_PATH,
    element: <SaasAdminSurface />,
    children: [
      // Dashboard
      { path: "dashboard/overview", element: <DashboardOverviewScreen /> },

      // Tenant Management
      { path: "tenants/all-tenants", element: <AllTenantsScreen /> },
      { path: "tenants/create-tenant", element: <CreateTenantScreen /> },
      { path: "tenants/details/:tenantId", element: <TenantDetailsScreen /> },
      { path: "tenants/configuration/:tenantId", element: <TenantConfigurationScreen /> },
      { path: "tenants/status", element: <TenantStatusScreen /> },

      // Staff & Access Management
      { path: "staff-management/staff-accounts", element: <StaffAccountsScreen /> },
      { path: "staff-management/staff-accounts/:staffId", element: <StaffDetailsScreen /> },
      { path: "staff-management/edit/:staffId", element: <StaffEditScreen /> },
      { path: "staff-management/create-staff", element: <CreateStaffScreen /> },
      { path: "staff-management/roles", element: <RolesManagementScreen /> },
      { path: "staff-management/roles/new", element: <RoleFormScreen /> },
      { path: "staff-management/roles/edit/:roleId", element: <RoleFormScreen /> },
      { path: "staff-management/roles/:roleId", element: <RoleDetailsScreen /> },
      { path: "staff-management/permissions", element: <PermissionsManagementScreen /> },
      { path: "staff-management/role-assignment", element: <RoleAssignmentScreen /> },
      { path: "staff-management/audit-logs", element: <AccessAuditLogsScreen /> },

      // My Account
      { path: "my-account/change-password", element: <ChangePasswordScreen /> },

      // Config-driven screens (lists and setting panels) for the remaining
      // sidebar sections.
      ...RESOURCE_LISTS.map((config) => ({
        path: relativePath(config.path),
        element: <ResourceListScreen config={config} />,
      })),
      ...RESOURCE_PANELS.map((config) => ({
        path: relativePath(config.path),
        element: <ConfigPanelScreen config={config} />,
      })),
    ],
  },
];

### 1.3 Resources Index (Config Aggregation)
import type { ResourceListConfig, ConfigPanelConfig } from "../components/resource/types";
import { SERVICE_MANAGEMENT_LISTS } from "./serviceManagement";
import { SLA_MANAGEMENT_LISTS } from "./slaManagement";
import { WORKFLOW_MANAGEMENT_LISTS } from "./workflowManagement";
import { ITSM_CONFIGURATION_LISTS, ITSM_CONFIGURATION_PANELS } from "./itsmConfiguration";
import { KNOWLEDGE_MANAGEMENT_LISTS } from "./knowledgeManagement";
import { CMDB_ASSET_MANAGEMENT_LISTS } from "./cmdbAssets";
import { EMAIL_NOTIFICATION_LISTS } from "./emailNotifications";
import { INTEGRATIONS_API_LISTS, INTEGRATIONS_API_PANELS } from "./integrationsApi";
import { SUPPORT_MANAGEMENT_LISTS } from "./supportManagement";
import { REPORTS_ANALYTICS_LISTS } from "./reportsAnalytics";
import { SECURITY_AUDIT_LISTS, SECURITY_AUDIT_EXTRA_LISTS, SECURITY_AUDIT_PANELS } from "./securityAudit";
import { SYSTEM_ADMINISTRATION_LISTS } from "./systemAdministration";
import { PLATFORM_SETTINGS_LISTS, PLATFORM_SETTINGS_PANELS } from "./platformSettings";
import { MY_ACCOUNT_LISTS, MY_ACCOUNT_PANELS } from "./myAccount";
import { APPROVAL_MANAGEMENT_LISTS } from "./approvals";

export const RESOURCE_LISTS: ResourceListConfig[] = [
  ...SERVICE_MANAGEMENT_LISTS,
  ...SLA_MANAGEMENT_LISTS,
  ...WORKFLOW_MANAGEMENT_LISTS,
  ...ITSM_CONFIGURATION_LISTS,
  ...KNOWLEDGE_MANAGEMENT_LISTS,
  ...CMDB_ASSET_MANAGEMENT_LISTS,
  ...EMAIL_NOTIFICATION_LISTS,
  ...INTEGRATIONS_API_LISTS,
  ...SUPPORT_MANAGEMENT_LISTS,
  ...REPORTS_ANALYTICS_LISTS,
  ...SECURITY_AUDIT_LISTS,
  ...SECURITY_AUDIT_EXTRA_LISTS,
  ...SYSTEM_ADMINISTRATION_LISTS,
  ...PLATFORM_SETTINGS_LISTS,
  ...MY_ACCOUNT_LISTS,
  ...APPROVAL_MANAGEMENT_LISTS,
];

export const RESOURCE_PANELS: ConfigPanelConfig[] = [
  ...ITSM_CONFIGURATION_PANELS,
  ...INTEGRATIONS_API_PANELS,
  ...SECURITY_AUDIT_PANELS,
  ...PLATFORM_SETTINGS_PANELS,
  ...MY_ACCOUNT_PANELS,
];

export const SAAS_ADMIN_BASE = "/saas-admin";

export function relativePath(path: string): string {
  return path.replace(SAAS_ADMIN_BASE, "").replace(/^\/+/, "");
}

### 1.4 Resource Types
import type { ReactNode } from "react";
import type { Column } from "../ui/DataTable";
import type { FilterConfig } from "../ui/SearchFilters";
import type { StatusVariant } from "../ui/StatusBadge";
import type { StatCardProps } from "../ui/StatCard";

export type ResourceRow = Record<string, unknown>;

export interface ResourceQueryResult {
  data?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  refetch?: () => void;
}

export type ResourceMutationResult = [
  trigger: (body?: unknown) => Promise<unknown>,
  result?: { isLoading?: boolean; error?: unknown; status?: string },
];

export interface ResourceListState {
  search: string;
  filters: Record<string, string | number | boolean>;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export type ResourceDataSource =
  | {
      kind: "api";
      useList: (args: unknown) => ResourceQueryResult;
      buildParams?: (state: ResourceListState) => unknown;
      extractRows?: (payload: unknown) => ResourceRow[];
    }
  | {
      kind: "static";
      rows: ResourceRow[];
    };

export type FieldType = "text" | "textarea" | "number" | "select" | "boolean" | "password";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string | number; label: string }[];
  /**
   * Reusable dynamic option source for `select` fields. Rendered by a
   * dedicated component so hook rules are respected (e.g. `tenants` loads the
   * tenant list through the shared RTK Query hook).
   */
  optionsSource?: "tenants";
  placeholder?: string;
  required?: boolean;
  help?: string;
  readOnly?: boolean;
}

export type ResourceMutationHook = (...args: unknown[]) => ResourceMutationResult;

export interface ResourceCreateConfig {
  title: string;
  description?: string;
  fields: FormField[];
  useCreate: ResourceMutationHook;
  buildBody?: (values: Record<string, unknown>) => unknown;
  successMessage?: string;
  buttonLabel?: string;
}

export interface ResourceRowAction {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "ghost";
  onClick: (row: ResourceRow) => void;
  show?: (row: ResourceRow) => boolean;
}

export interface ResourceStatConfig {
  key: string;
  label: string;
  compute: (rows: ResourceRow[]) => number;
  color?: StatCardProps["color"];
  icon?: ReactNode;
}

export interface ResourceQuickAction {
  label: string;
  icon?: ReactNode;
  useAction: ResourceMutationHook;
  buildArg: (row: ResourceRow) => unknown;
  successMessage?: (row: ResourceRow) => string;
}

export interface ResourceListConfig {
  path: string;
  title: string;
  description?: string;
  sectionLabel: string;
  columns: Column<ResourceRow>[];
  rowId: string;
  source: ResourceDataSource;
  searchable?: (row: ResourceRow) => string;
  filters?: FilterConfig[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  detailPath?: (row: ResourceRow) => string | undefined;
  actions?: ResourceRowAction[];
  quickAction?: ResourceQuickAction;
  create?: ResourceCreateConfig;
  stats?: ResourceStatConfig[];
  statusVariant?: (row: ResourceRow) => StatusVariant;
  backTo?: string;
  backLabel?: string;
}

export interface ConfigPanelConfig {
  path: string;
  title: string;
  description?: string;
  sectionLabel: string;
  fields: FormField[];
  useGet: (args: unknown) => ResourceQueryResult;
  useUpdate?: ResourceMutationHook;
  getValues: (payload: unknown) => Record<string, unknown>;
  buildBody: (values: Record<string, unknown>) => unknown;
  saveLabel?: string;
  savedMessage?: string;
  stats?: (value: unknown) => Array<{ label: string; value: string | number; color?: StatCardProps["color"] }>;
  backTo?: string;
  backLabel?: string;
}

export function asQueryHook(fn: unknown): (args: unknown) => ResourceQueryResult {
  return fn as (args: unknown) => ResourceQueryResult;
}

export function asMutationHook(fn: unknown): ResourceMutationHook {
  return fn as ResourceMutationHook;
}

export type StatusVariantFor = (status: string | undefined) => StatusVariant;

export const VARIANT_FROM_STATUS: StatusVariantFor = (status) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "active" || s === "enabled" || s === "published" || s === "completed" || s === "sent" || s === "success" || s === "ok" || s === "running") return "active";
  if (s === "pending" || s === "queued" || s === "draft" || s === "in_progress" || s === "unconfigured" || s === "unverified" || s === "cancelled") return "pending";
  if (s === "suspended" || s === "disabled" || s === "retired" || s === "failed" || s === "error" || s === "denied" || s === "degraded" || s === "down" || s === "bounced" || s === "suppressed" || s === "rejected") return "suspended";
  if (s === "closed" || s === "archived" || s === "expired" || s === "revoked" || s === "inactive") return "archived";
  return "default";
};

---
## 2) Resource List/Panel Components (Generic)

### 2.1 ResourceListScreen (Generic List)
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { SaasAdminScreen } from "../SaasAdminScreen";
import { StatCard } from "../ui";
import { DataTable } from "../ui/DataTable";
import { SearchFilters } from "../ui/SearchFilters";
import { Pagination } from "../ui/Pagination";
import { StatusBadge } from "../ui/StatusBadge";
import { Modal } from "../ui/Modal";
import { Button } from "@components/common/ui";
import { apiErrorMessage } from "@services/saasadmin";
import type { ResourceListConfig, ResourceListState, ResourceRow } from "./types";
import { extractRows, rowText, getField, comparable, matchFilter } from "./helpers";
import { FormGrid } from "./FormFields";

interface ResourceListScreenProps {
  config: ResourceListConfig;
}

function useResourceListState(config: ResourceListConfig) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize ?? 10);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);

  const state: ResourceListState = { search, filters, page, pageSize, sortBy, sortOrder };

  const queryArgs =
    config.source.kind === "api" && config.source.buildParams ? config.source.buildParams(state) : undefined;
  const apiResult = config.source.kind === "api" ? config.source.useList(queryArgs) : undefined;

  const rawRows: ResourceRow[] = useMemo(() => {
    if (config.source.kind === "static") return config.source.rows;
    const payload = apiResult?.data;
    if (config.source.extractRows) return config.source.extractRows(payload);
    return extractRows(payload);
  }, [config.source, apiResult?.data]);

  const filterConfigs = config.filters ?? [];

  const visibleRows = useMemo(() => {
    let out = rawRows;
    const term = search.trim().toLowerCase();
    if (term) {
      out = out.filter((row) => {
        const hay = config.searchable ? config.searchable(row).toLowerCase() : rowText(row).toLowerCase();
        return hay.includes(term);
      });
    }
    for (const f of filterConfigs) {
      const expected = filters[f.key];
      if (expected === "" || expected === undefined) continue;
      out = out.filter((row) => matchFilter(row, f.key, f.type === "daterange" ? "date" : f.type, expected));
    }
    return out;
  }, [rawRows, search, filters, config, filterConfigs]);

  const sorted = useMemo(() => {
    if (!sortBy) return visibleRows;
    const direction = sortOrder === "asc" ? 1 : -1;
    return [...visibleRows].sort((a, b) => {
      const av = comparable(getField(a, sortBy));
      const bv = comparable(getField(b, sortBy));
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });
  }, [visibleRows, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return {
    search,
    setSearch,
    filters,
    setFilters,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    rows: paged,
    total: sorted.length,
    totalPages,
    apiResult,
    createOpen,
    setCreateOpen,
  };
}

export function ResourceListScreen({ config }: ResourceListScreenProps) {
  const structureKey = [
    config.path,
    config.source.kind,
    config.create ? "create" : "none",
    config.quickAction ? "quick" : "none",
  ].join(":");
  return <ResourceListContent key={structureKey} config={config} />;
}

function ResourceListContent({ config }: ResourceListScreenProps) {
  const {
    search,
    setSearch,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    rows,
    total,
    totalPages,
    apiResult,
    createOpen,
    setCreateOpen,
  } = useResourceListState(config);

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const create = config.create;
  const [createTrigger] = create ? create.useCreate() : [null, null] as const;
  const quick = config.quickAction;
  const [quickTrigger] = quick ? quick.useAction() : [null, null] as const;
  const [quickBusy, setQuickBusy] = useState<string | null>(null);

  const runQuickAction = async (row: ResourceRow) => {
    if (!quick || !quickTrigger) return;
    setQuickBusy(String(row[config.rowId] ?? "row"));
    try {
      await quickTrigger(quick.buildArg(row));
      toast.success(quick.successMessage ? quick.successMessage(row) : `${quick.label} saved.`);
      apiResult?.refetch?.();
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setQuickBusy(null);
    }
  };

  const openCreate = () => {
    const initial: Record<string, unknown> = {};
    for (const field of create?.fields ?? []) {
      initial[field.key] = field.type === "boolean" ? false : "";
    }
    setForm(initial);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!create) return;
    setSubmitting(true);
    try {
      const body = create.buildBody ? create.buildBody(form) : form;
      await createTrigger?.(body);
      toast.success(create.successMessage ?? "Created successfully.");
      setCreateOpen(false);
      apiResult?.refetch?.();
      setPage(1);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [{ label: "SaaS Admin" }, { label: config.sectionLabel }, { label: config.title }];

  const statsNodes = config.stats?.map((stat) => (
    <StatCard key={stat.key} label={stat.label} value={stat.compute(rows)} color={stat.color} icon={stat.icon} />
  ));

  const renderCell = (row: ResourceRow, key: string) => {
    const value = getField(row, key);
    if (key === "status" || key.endsWith(".status")) {
      return (
        <StatusBadge
          status={String(value ?? "—")}
          variant={config.statusVariant ? config.statusVariant(row) : undefined}
        />
      );
    }
    return <>{formatCell(value)}</>;
  };

  return (
    <SaasAdminScreen
      title={config.title}
      description={config.description}
      breadcrumbs={breadcrumbs}
      backTo={config.backTo}
      backLabel={config.backLabel}
      actions={
        create ? (
          <Button onClick={openCreate}>
            <span className="mr-1">+</span>
            {create.buttonLabel ?? `Create ${config.title.replace(/\s*s$/, "")}`}
          </Button>
        ) : undefined
      }
    >
      {statsNodes && statsNodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{statsNodes}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 pb-0">
          <SearchFilters
            searchValue={search}
            onSearchChange={setSearch}
            placeholder={`Search ${config.title.toLowerCase()}…`}
            filters={config.filters}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onClearFilters={() => setFilters({})}
          />
        </div>

        {Boolean(apiResult?.error) && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Failed to load {config.title.toLowerCase()}: {apiErrorMessage(((apiResult?.error as { data?: unknown } | undefined)?.data))}
            </span>
          </div>
        )}

        <DataTable
          columns={config.columns.map((col) => ({
            ...col,
            render: col.render ?? ((row: ResourceRow) => renderCell(row, col.key)),
          }))}
          rows={rows}
          rowKey={(row) => String(row[config.rowId] ?? rowText(row))}
          loading={apiResult?.isLoading}
          emptyTitle={config.emptyTitle ?? "No records found"}
          emptyDescription={config.emptyDescription}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          actions={[
            ...(config.actions ?? []),
            ...(quick
              ? [
                  {
                    label: quickBusy ? "Working…" : quick.label,
                    icon: quick.icon,
                    variant: "ghost" as const,
                    onClick: (row: ResourceRow) => runQuickAction(row),
                    show: (row: ResourceRow) => quickBusy !== String(row[config.rowId] ?? "row"),
                  },
                ]
              : []),
          ]}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {create && (
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title={create.title}
          description={create.description}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={submitCreate} disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </>
          }
        >
          <FormGrid
            fields={create.fields}
            values={form}
            onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
          />
        </Modal>
      )}
    </SaasAdminScreen>
  );
}

function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record.name ?? record.key ?? record.label ?? record.email;
    if (name !== undefined) return String(name);
    const keys = Object.keys(record);
    return keys.length === 0 ? "—" : `{${keys.length} props}`;
  }
  return String(value);
}

### 2.2 ConfigPanelScreen (Generic Panel)
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { AlertCircle, Save } from "lucide-react";
import { SaasAdminScreen } from "../SaasAdminScreen";
import { StatCard } from "../ui";
import { Button } from "@components/common/ui";
import { apiErrorMessage } from "@services/saasadmin";
import type { ConfigPanelConfig } from "./types";
import { extractValue } from "./helpers";
import { FormGrid } from "./FormFields";

interface ConfigPanelScreenProps {
  config: ConfigPanelConfig;
}

export function ConfigPanelScreen({ config }: ConfigPanelScreenProps) {
  const structureKey = `${config.path}:${config.useUpdate ? "update" : "readonly"}`;
  return <ConfigPanelContent key={structureKey} config={config} />;
}

function ConfigPanelContent({ config }: ConfigPanelScreenProps) {
  const result = config.useGet(undefined);
  const [updateTrigger] = config.useUpdate ? config.useUpdate() : [null, null] as const;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  const value = useMemo(() => extractValue(result.data), [result.data]);

  useEffect(() => {
    if (!initialized && value !== undefined && value !== null) {
      setForm(config.getValues(value));
      setInitialized(true);
    }
  }, [value, initialized, config]);

  const save = async () => {
    if (!updateTrigger) return;
    setSaving(true);
    try {
      await updateTrigger(config.buildBody(form));
      toast.success(config.savedMessage ?? `${config.title} saved.`);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [{ label: "SaaS Admin" }, { label: config.sectionLabel }, { label: config.title }];

  const stats = config.stats?.(value) ?? [];

  return (
    <SaasAdminScreen
      title={config.title}
      description={config.description}
      breadcrumbs={breadcrumbs}
      backTo={config.backTo}
      backLabel={config.backLabel}
      actions={
        updateTrigger ? (
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving…" : config.saveLabel ?? "Save Changes"}
          </Button>
        ) : undefined
      }
    >
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={`${stat.label}-${i}`} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>
      )}

      {Boolean(result.error) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{apiErrorMessage((result.error as { data?: unknown }).data)}</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {result.isLoading && !initialized ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          <FormGrid fields={config.fields} values={form} onChange={(key, v) => setForm((prev) => ({ ...prev, [key]: v }))} />
        )}
      </div>
    </SaasAdminScreen>
  );
}

### 2.3 Resource Helpers
import type { ResourceRow } from "./types";

export function extractRows(payload: unknown): ResourceRow[] {
  if (Array.isArray(payload)) return payload as ResourceRow[];
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  if (Array.isArray(data)) return data as ResourceRow[];
  if (data && typeof data === "object") {
    const items = (data as { items?: unknown; results?: unknown }).items ?? (data as { results?: unknown }).results;
    if (Array.isArray(items)) return items as ResourceRow[];
  }
  return [];
}

export function extractValue(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

export function rowText(row: ResourceRow): string {
  return JSON.stringify(row) ?? "";
}

export function getField(row: ResourceRow, key: string): unknown {
  if (!key) return undefined;
  const parts = key.split(".");
  let value: unknown = row;
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

export function formatValue(row: ResourceRow, key: string): string {
  const value = getField(row, key);
  return displayValue(value);
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const count = Object.keys(value).length;
    return count === 0 ? "—" : `{${count} props}`;
  }
  return String(value);
}

export function truncate(value: unknown, max = 60): string {
  const text = displayValue(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function comparable(value: unknown): string | number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    const name = (value as { name?: unknown; key?: unknown; label?: unknown }).name ?? (value as { key?: unknown }).key ?? (value as { label?: unknown }).label;
    if (name !== undefined) return String(name);
    return "";
  }
  return String(value ?? "");
}

export function formatDate(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function matchFilter(row: ResourceRow, key: string, kind: "select" | "boolean" | "date" | "text", expected: string | number | boolean): boolean {
  const actual = getField(row, key);
  if (expected === "" || expected === undefined) return true;
  if (kind === "boolean") return Boolean(actual) === Boolean(expected);
  return comparable(actual).toString().toLowerCase().includes(String(expected).toLowerCase());
}

export function emailTemplateVariant(status: string | undefined) {
  const s = String(status ?? "").toLowerCase();
  if (s === "draft") return "draft" as const;
  if (s === "enabled" || s === "active") return "active" as const;
  if (s === "disabled" || s === "retired") return "disabled" as const;
  return "default" as const;
}

---
## 3) Dashboard

### 3.1 DashboardOverviewScreen (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/dashboard/OverviewScreen.tsx`)

import { Building2, Users, LifeBuoy, ClipboardCheck, Activity } from "lucide-react";
import { ErrorState } from "@components/common/ui";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import {
  useDashboardSummaryQuery,
  useDashboardRecentActivityQuery,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

function num(value: unknown): string {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function readRecord(source: unknown, ...path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon: React.ReactNode;
}

const TONE: Record<NonNullable<MetricProps["tone"]>, string> = {
  default: "text-slate-900",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

function Metric({ label, value, hint, tone = "default", icon }: MetricProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${TONE[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function DashboardOverviewScreen() {
  const summary = useDashboardSummaryQuery();
  const activity = useDashboardRecentActivityQuery();

  const s = summary.data?.data as ApiRecord | undefined;
  const events = (activity.data?.data ?? []) as ApiRecord[];

  return (
    <SaasAdminScreen
      title="Dashboard Overview"
      description="Platform health and key metrics at a glance."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Dashboard" },
        { label: "Overview" },
      ]}
    >
      <div className="space-y-6">
        {summary.isError ? (
          <ErrorState message="Could not load the dashboard summary." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Total Tenants"
              value={summary.isLoading ? "…" : num(readRecord(s, "tenants", "total"))}
              hint={`${num(readRecord(s, "tenants", "active"))} active`}
              icon={<Building2 className="h-4 w-4" />}
            />
            <Metric
              label="Active Staff"
              value={summary.isLoading ? "…" : num(readRecord(s, "staff", "active"))}
              hint={`${num(readRecord(s, "staff", "total"))} total`}
              tone="success"
              icon={<Users className="h-4 w-4" />}
            />
            <Metric
              label="Open Tickets"
              value={summary.isLoading ? "…" : num(readRecord(s, "support", "openTickets"))}
              tone="warning"
              icon={<LifeBuoy className="h-4 w-4" />}
            />
            <Metric
              label="Pending Approvals"
              value={summary.isLoading ? "…" : num(readRecord(s, "approvals", "pending"))}
              tone="danger"
              icon={<ClipboardCheck className="h-4 w-4" />}
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>

          {activity.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading activity…</p>
          ) : activity.isError ? (
            <p className="mt-3 text-sm text-red-600">Could not load recent activity.</p>
          ) : events.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No recent platform activity yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {events.map((event, index) => {
                const actor =
                  typeof event.actor === "object" && event.actor
                    ? String((event.actor as ApiRecord).email ?? (event.actor as ApiRecord).name ?? "system")
                    : "system";
                const when = event.createdAt ? new Date(String(event.createdAt)).toLocaleString() : "";
                return (
                  <li key={String(event.id ?? index)} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                    <span className="text-slate-700">
                      <span className="font-medium">{String(event.action ?? "event")}</span>
                      {event.resourceType ? <span className="text-slate-400"> · {String(event.resourceType)}</span> : null}
                      <span className="text-slate-400"> · {actor}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">{when}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </SaasAdminScreen>
  );
}



---
## 4) Tenant Management (Explicit)

### 4.1 AllTenantsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/tenants/all-tenants/AllTenantsScreen.tsx`)

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Settings, PauseCircle, PlayCircle, Building2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, ConfirmDialog, StatusBadge, StatCard } from "@/screens/saas-admin/components/ui";
import { Button, ErrorState } from "@components/common/ui";
import {
  useListTenantsQuery,
  useSuspendTenantMutation,
  useReactivateTenantMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";
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
    case "ACTIVE": return "active";
    case "SUSPENDED": return "suspended";
    case "ARCHIVED": return "archived";
    case "FAILED": return "failed";
    default: return "pending";
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

export function AllTenantsScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListTenantsQuery({ limit: 100 });
  const [suspendTenant] = useSuspendTenantMutation();
  const [reactivateTenant] = useReactivateTenantMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dialog, setDialog] = useState<{ tenant: Tenant | null; action: "suspend" | "reactivate" }>({ tenant: null, action: "suspend" });
  const [dialogBusy, setDialogBusy] = useState(false);

  const tenants = useMemo(() => ((data?.data ?? []) as ApiRecord[]).map(mapTenant), [data]);

  const filteredTenants = useMemo(() => {
    return tenants
      .filter((tenant) => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          tenant.name.toLowerCase().includes(term) ||
          tenant.slug.toLowerCase().includes(term) ||
          tenant.primaryContactEmail.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || tenant.status === mapStatus(statusFilter);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortBy as keyof Tenant] ?? "";
        const bVal = b[sortBy as keyof Tenant] ?? "";
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [tenants, searchQuery, statusFilter, sortBy, sortOrder]);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(start, start + itemsPerPage);
  }, [filteredTenants, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / itemsPerPage));

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
    { key: "status", header: "Status", render: (row: Tenant) => <StatusBadge status={row.status} variant={statusVariant[row.status]} size="sm" />, sortable: true },
    {
      key: "provisioningStatus",
      header: "Provisioning",
      render: (row: Tenant) => (
        <StatusBadge status={row.provisioningStatus} variant={provisioningVariant[row.provisioningStatus] ?? "default"} size="sm" />
      ),
      sortable: true,
    },
    {
      key: "primaryContactName",
      header: "Primary Contact",
      render: (row: Tenant) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.primaryContactName || "—"}</p>
          {row.primaryContactEmail ? <p className="text-xs text-slate-500">{row.primaryContactEmail}</p> : null}
        </div>
      ),
      sortable: true,
    },
    { key: "userCount", header: "Users", render: (row: Tenant) => <span className="text-sm text-slate-700">{row.userCount.toLocaleString()}</span>, sortable: true },
    { key: "domainCount", header: "Domains", render: (row: Tenant) => <span className="text-sm text-slate-700">{row.domainCount}</span>, sortable: true },
    { key: "createdAt", header: "Created", render: (row: Tenant) => <span className="text-sm text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</span>, sortable: true },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const actions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row: Tenant) => navigate(`/saas-admin/tenants/details/${row.id}`) },
    { label: "Configure", icon: <Settings className="h-3.5 w-3.5" />, onClick: (row: Tenant) => navigate(`/saas-admin/tenants/configuration/${row.id}`) },
    {
      label: "Suspend",
      icon: <PauseCircle className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      show: (row: Tenant) => row.status === "active" || row.status === "pending",
      onClick: (row: Tenant) => setDialog({ tenant: row, action: "suspend" }),
    },
    {
      label: "Reactivate",
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      show: (row: Tenant) => row.status === "suspended",
      onClick: (row: Tenant) => setDialog({ tenant: row, action: "reactivate" }),
    },
  ];

  const handleConfirm = async () => {
    const tenant = dialog.tenant;
    if (!tenant) return;
    setDialogBusy(true);
    try {
      if (dialog.action === "suspend") await suspendTenant({ tenantId: tenant.id, body: { reason: "Suspended from the platform admin console." } }).unwrap();
      else await reactivateTenant(tenant.id).unwrap();
      setDialog({ tenant: null, action: "suspend" });
    } finally {
      setDialogBusy(false);
    }
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
        <StatCard label="Total Tenants" value={tenants.length} color="info" icon={<Building2 className="h-6 w-6" />} />
        <StatCard label="Active" value={tenants.filter((t) => t.status === "active").length} color="success" icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard label="Provisioning" value={tenants.filter((t) => t.status === "pending").length} color="warning" icon={<AlertCircle className="h-6 w-6" />} />
        <StatCard label="Suspended" value={tenants.filter((t) => t.status === "suspended").length} color="danger" icon={<XCircle className="h-6 w-6" />} />
      </div>

      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={(value) => { setSearchQuery(value); setCurrentPage(1); }}
        placeholder="Search by name, slug, or primary contact email..."
        filters={[
          { key: "status", label: "Status", type: "select", options: statusOptions },
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(key, value) => {
          if (key === "status") { setStatusFilter(value as string); setCurrentPage(1); }
        }}
        onClearFilters={() => { setStatusFilter(""); setCurrentPage(1); }}
      />

      {isError ? (
        <ErrorState message="Could not load tenants." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paginatedTenants}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/saas-admin/tenants/details/${row.id}`)}
            loading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selection={{ selectedKeys, onChange: setSelectedKeys, getKey: (row) => row.id }}
            actions={actions}
            emptyTitle="No tenants found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTenants.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!dialog.tenant}
        onClose={() => setDialog({ tenant: null, action: "suspend" })}
        onConfirm={handleConfirm}
        loading={dialogBusy}
        title={dialog.action === "suspend" ? "Suspend Tenant" : "Reactivate Tenant"}
        message={
          dialog.action === "suspend"
            ? `Are you sure you want to suspend "${dialog.tenant?.name}"? This will block user sign-in and new work creation for this tenant.`
            : `Are you sure you want to reactivate "${dialog.tenant?.name}"? This will restore tenant capabilities per platform policy.`
        }
        confirmLabel={dialog.action === "suspend" ? "Suspend" : "Reactivate"}
        variant={dialog.action === "suspend" ? "danger" : "info"}
      />
    </SaasAdminScreen>
  );
}


### 4.2 CreateTenantScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/tenants/create-tenant/CreateTenantScreen.tsx`)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Select, Textarea } from "@components/common/ui";
import { useCreateTenantMutation } from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";

interface TenantFormData {
  name: string;
  slug: string;
  primaryContactName: string;
  primaryContactEmail: string;
  timezone: string;
  locale: string;
  industry: string;
  website: string;
  notes: string;
}

const initialFormData: TenantFormData = {
  name: "",
  slug: "",
  primaryContactName: "",
  primaryContactEmail: "",
  timezone: "UTC",
  locale: "en-US",
  industry: "",
  website: "",
  notes: "",
};

const timezones = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];
const locales = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES", "ja-JP", "zh-CN", "pt-BR"];

export function CreateTenantScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createTenant, { isLoading }] = useCreateTenantMutation();

  const handleChange = (field: keyof TenantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TenantFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Tenant name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Tenant name must be at least 2 characters";
    if (formData.slug && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(formData.slug)) {
      newErrors.slug = "Only lowercase letters, numbers and hyphens allowed";
    }
    if (formData.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    try {
      await createTenant({
        name: formData.name.trim(),
        ...(formData.slug.trim() ? { slug: formData.slug.trim() } : {}),
        ...(formData.primaryContactName.trim() ? { primaryContactName: formData.primaryContactName.trim() } : {}),
        ...(formData.primaryContactEmail.trim() ? { primaryContactEmail: formData.primaryContactEmail.trim() } : {}),
        timezone: formData.timezone,
        locale: formData.locale,
        ...(formData.industry.trim() ? { industry: formData.industry.trim() } : {}),
        ...(formData.website.trim() ? { website: formData.website.trim() } : {}),
        ...(formData.notes.trim() ? { notes: formData.notes.trim() } : {}),
      }).unwrap();
      navigate("/saas-admin/tenants/all-tenants");
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  return (
    <SaasAdminScreen
      title="Create Tenant"
      description="Register a new organization on the platform."
      backTo="/saas-admin/tenants/all-tenants"
      backLabel="Back to All Tenants"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management", href: "/saas-admin/tenants/all-tenants" },
        { label: "Create Tenant" },
      ]}
      actions={
        <Button onClick={handleSubmit} loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Tenant</Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tenant Name" htmlFor="name">
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Acme Corporation" required />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </Field>
            <Field label="Slug (optional)" htmlFor="slug">
              <Input id="slug" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value.toLowerCase())} placeholder="acme-corp" />
              <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens. Derived from the name if omitted.</p>
              {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug}</p> : null}
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input id="industry" value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Technology" />
            </Field>
            <Field label="Website" htmlFor="website">
              <Input id="website" type="url" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://acme.com" />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact Name" htmlFor="primaryContactName">
              <Input id="primaryContactName" value={formData.primaryContactName} onChange={(e) => handleChange("primaryContactName", e.target.value)} placeholder="John Smith" />
            </Field>
            <Field label="Contact Email" htmlFor="primaryContactEmail">
              <Input id="primaryContactEmail" type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange("primaryContactEmail", e.target.value)} placeholder="contact@acme.com" />
              {errors.primaryContactEmail ? <p className="mt-1 text-xs text-red-600">{errors.primaryContactEmail}</p> : null}
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Regional</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Timezone" htmlFor="timezone">
              <Select id="timezone" value={formData.timezone} onChange={(e) => handleChange("timezone", e.target.value)}>
                {timezones.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Locale" htmlFor="locale">
              <Select id="locale" value={formData.locale} onChange={(e) => handleChange("locale", e.target.value)}>
                {locales.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notes" htmlFor="notes">
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} placeholder="Internal notes about this tenant" />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/tenants/all-tenants")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Tenant</Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}


### 4.3 TenantDetailsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/tenants/tenant-details/TenantDetailsScreen.tsx`)

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Settings, FileText, Users, ShieldCheck, Link as LinkIcon, Activity, PauseCircle, PlayCircle } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState } from "@components/common/ui";
import { StatusBadge, StatCard, DataTable, ConfirmDialog } from "@/screens/saas-admin/components/ui";
import type { StatusVariant } from "@/screens/saas-admin/components/ui";
import { cn } from "@utils/cn";
import {
  useGetTenantQuery,
  useTenantOverviewQuery,
  useTenantUsersQuery,
  useTenantHealthQuery,
  useTenantActivityQuery,
  useSuspendTenantMutation,
  useReactivateTenantMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "users", label: "Users", icon: Users },
  { key: "health", label: "Health", icon: ShieldCheck },
  { key: "activity", label: "Activity", icon: FileText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const statusVariant: Record<string, StatusVariant> = {
  ACTIVE: "active",
  PROVISIONING: "pending",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
  FAILED: "disabled",
};

function countOf(record: ApiRecord | undefined, key: string): number {
  const counts = (record?._count ?? {}) as ApiRecord;
  return Number(counts[key] ?? 0);
}

function fmt(value: unknown): string {
  return value ? new Date(String(value)).toLocaleString() : "—";
}

export function TenantDetailsScreen() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [dialog, setDialog] = useState<"suspend" | "reactivate" | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const tenantQuery = useGetTenantQuery(tenantId ?? "", { skip: !tenantId });
  const overviewQuery = useTenantOverviewQuery(tenantId ?? "", { skip: !tenantId });
  const usersQuery = useTenantUsersQuery({ tenantId: tenantId ?? "", limit: 100 }, { skip: !tenantId || activeTab !== "users" });
  const healthQuery = useTenantHealthQuery(tenantId ?? "", { skip: !tenantId || activeTab !== "health" });
  const activityQuery = useTenantActivityQuery({ tenantId: tenantId ?? "", limit: 50 }, { skip: !tenantId || activeTab !== "activity" });
  const [suspendTenant] = useSuspendTenantMutation();
  const [reactivateTenant] = useReactivateTenantMutation();

  const tenant = tenantQuery.data?.data as ApiRecord | undefined;
  const overview = overviewQuery.data?.data as ApiRecord | undefined;
  const status = String(tenant?.status ?? "");

  if (tenantQuery.isLoading) {
    return (
      <SaasAdminScreen title="Tenant" description="Loading tenant…" backTo="/saas-admin/tenants/all-tenants" backLabel="Back to All Tenants" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Tenant Management" }, { label: "All Tenants", href: "/saas-admin/tenants/all-tenants" }, { label: "Tenant" }]}>
        <p className="text-sm text-slate-500">Loading tenant…</p>
      </SaasAdminScreen>
    );
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <SaasAdminScreen title="Tenant" description="Tenant details" backTo="/saas-admin/tenants/all-tenants" backLabel="Back to All Tenants" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Tenant Management" }, { label: "All Tenants", href: "/saas-admin/tenants/all-tenants" }, { label: "Tenant" }]}>
        <ErrorState message="Could not load this tenant." />
      </SaasAdminScreen>
    );
  }

  const name = String(tenant.name ?? "Tenant");

  const handleConfirm = async () => {
    if (!tenantId) return;
    if (dialog === "suspend") {
      const reason = window.prompt("Provide a reason for suspending this tenant:", "Suspended from the platform admin console.");
      if (!reason || reason.trim().length < 4) return;
      setDialogBusy(true);
      try {
        await suspendTenant({ tenantId, body: { reason: reason.trim() } }).unwrap();
        setDialog(null);
      } finally {
        setDialogBusy(false);
      }
    } else if (dialog === "reactivate") {
      setDialogBusy(true);
      try {
        await reactivateTenant(tenantId).unwrap();
        setDialog(null);
      } finally {
        setDialogBusy(false);
      }
    }
  };

  const renderOverview = () => {
    const enabledServices = Number((overview?.operational as ApiRecord | undefined)?.enabledServices ?? 0);
    const recentEvents = Number((overview?.operational as ApiRecord | undefined)?.recentActivityEvents ?? 0);
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={countOf(tenant, "memberships")} icon={<Users className="h-6 w-6" />} color="info" />
          <StatCard label="Domains" value={countOf(tenant, "domains")} icon={<LinkIcon className="h-6 w-6" />} color="info" />
          <StatCard label="Enabled Services" value={enabledServices} icon={<ShieldCheck className="h-6 w-6" />} color="success" />
          <StatCard label="Activity (7d)" value={recentEvents} icon={<Activity className="h-6 w-6" />} color="warning" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Slug</dt><dd className="font-mono">{String(tenant.slug ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={status} variant={statusVariant[status] ?? "default"} /></dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Provisioning</dt><dd className="font-medium">{String(tenant.provisioningStatus ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Industry</dt><dd className="font-medium">{String(tenant.industry ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Timezone</dt><dd className="font-medium">{String(tenant.timezone ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Locale</dt><dd className="font-medium">{String(tenant.locale ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="font-medium">{fmt(tenant.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd className="font-medium">{fmt(tenant.updatedAt)}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Contact</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium">{String(tenant.primaryContactName ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{String(tenant.primaryContactEmail ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Website</dt><dd className="font-medium">{String(tenant.website ?? "—")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Notes</dt><dd className="font-medium max-w-xs text-right">{String(tenant.notes ?? "—")}</dd></div>
            </dl>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link to={`/saas-admin/tenants/configuration/${tenantId}`}>
              <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Configure Tenant</Button>
            </Link>
            {status === "ACTIVE" && (
              <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50" onClick={() => setDialog("suspend")}>
                <PauseCircle className="h-4 w-4" /> Suspend Tenant
              </Button>
            )}
            {status === "SUSPENDED" && (
              <Button variant="outline" className="gap-2 text-emerald-600 hover:bg-emerald-50" onClick={() => setDialog("reactivate")}>
                <PlayCircle className="h-4 w-4" /> Reactivate Tenant
              </Button>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderUsers = () => {
    const payload = (usersQuery.data?.data ?? []) as ApiRecord[];
    const rows = payload.map((row) => {
      const user = (row.user ?? {}) as ApiRecord;
      return {
        id: String(row.id),
        name: String(user.displayName ?? [user.firstName, user.lastName].filter(Boolean).join(" ") ?? user.email ?? "—"),
        email: String(user.email ?? ""),
        status: String(user.status ?? ""),
        mfaEnabled: Boolean(user.mfaEnabled),
        lastLoginAt: user.lastLoginAt ? String(user.lastLoginAt) : "",
      };
    });
    const columns = [
      { key: "name", header: "Name", render: (r: typeof rows[number]) => <span className="font-medium text-slate-900">{r.name}</span> },
      { key: "email", header: "Email", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.email}</span> },
      { key: "status", header: "Status", render: (r: typeof rows[number]) => <StatusBadge status={r.status.toLowerCase()} variant={r.status.toUpperCase() === "ACTIVE" ? "active" : "pending"} size="sm" /> },
      { key: "mfaEnabled", header: "MFA", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.mfaEnabled ? "Enabled" : "Disabled"}</span> },
      { key: "lastLoginAt", header: "Last Login", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : "Never"}</span> },
    ];
    return usersQuery.isError ? (
      <ErrorState message="Could not load tenant users." />
    ) : (
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={usersQuery.isLoading} emptyTitle="No users" emptyDescription="This tenant has no members." />
    );
  };

  const renderHealth = () => {
    if (healthQuery.isError) return <ErrorState message="Could not load tenant health." />;
    const health = healthQuery.data?.data as ApiRecord | undefined;
    const checks = (health?.checks ?? []) as ApiRecord[];
    if (healthQuery.isLoading) return <p className="text-sm text-slate-500">Loading health…</p>;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Overall</span>
          <StatusBadge status={String(health?.status ?? "unknown")} variant={String(health?.status) === "healthy" ? "active" : "pending"} />
        </div>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {checks.map((check) => (
            <li key={String(check.name)} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-slate-800 capitalize">{String(check.name)}</span>
              <span className="flex items-center gap-3 text-sm text-slate-500">
                {String(check.detail ?? "")}
                <StatusBadge status={String(check.status)} variant={String(check.status) === "ok" ? "active" : "pending"} size="sm" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderActivity = () => {
    const payload = (activityQuery.data?.data ?? []) as ApiRecord[];
    const rows = payload.map((row) => ({
      id: String(row.id),
      createdAt: row.createdAt ? String(row.createdAt) : "",
      actorEmail: String(row.actorEmail ?? ""),
      action: String(row.action ?? ""),
      resourceType: String(row.resourceType ?? ""),
      outcome: String(row.outcome ?? "").toLowerCase(),
    }));
    const columns = [
      { key: "createdAt", header: "Timestamp", render: (r: typeof rows[number]) => <span className="text-sm font-mono">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</span> },
      { key: "action", header: "Action", render: (r: typeof rows[number]) => <StatusBadge status={r.action || "—"} variant="default" size="sm" /> },
      { key: "resourceType", header: "Resource", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.resourceType || "—"}</span> },
      { key: "actorEmail", header: "Actor", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.actorEmail || "system"}</span> },
      { key: "outcome", header: "Outcome", render: (r: typeof rows[number]) => <StatusBadge status={r.outcome} variant={r.outcome === "success" ? "active" : "default"} size="sm" /> },
    ];
    return activityQuery.isError ? (
      <ErrorState message="Could not load tenant activity." />
    ) : (
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={activityQuery.isLoading} emptyTitle="No activity" emptyDescription="No audit events recorded for this tenant." />
    );
  };

  return (
    <SaasAdminScreen
      title={name}
      description={`Status: ${status || "unknown"}`}
      backTo="/saas-admin/tenants/all-tenants"
      backLabel="Back to All Tenants"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management" },
        { label: "All Tenants", href: "/saas-admin/tenants/all-tenants" },
        { label: name },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/saas-admin/tenants/configuration/${tenantId}`)}><Edit className="h-4 w-4 mr-2" /> Configure</Button>
          {status === "ACTIVE" && <Button variant="outline" onClick={() => setDialog("suspend")} className="text-red-600 hover:bg-red-50"><PauseCircle className="h-4 w-4 mr-2" /> Suspend</Button>}
          {status === "SUSPENDED" && <Button variant="outline" onClick={() => setDialog("reactivate")} className="text-emerald-600 hover:bg-emerald-50"><PlayCircle className="h-4 w-4 mr-2" /> Reactivate</Button>}
        </div>
      }
    >
      <nav aria-label="Tenant tabs" className="mb-6 border-b border-slate-200">
        <ul className="flex flex-wrap gap-1 -mb-px">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {activeTab === "overview" ? renderOverview() : null}
      {activeTab === "users" ? renderUsers() : null}
      {activeTab === "health" ? renderHealth() : null}
      {activeTab === "activity" ? renderActivity() : null}

      <ConfirmDialog
        isOpen={!!dialog}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={dialogBusy}
        title={dialog === "suspend" ? "Suspend Tenant" : "Reactivate Tenant"}
        message={
          dialog === "suspend"
            ? `Are you sure you want to suspend "${name}"? This will block user sign-in and new work creation for this tenant.`
            : `Are you sure you want to reactivate "${name}"? This will restore tenant capabilities per platform policy.`
        }
        confirmLabel={dialog === "suspend" ? "Suspend" : "Reactivate"}
        variant={dialog === "suspend" ? "danger" : "info"}
      />
    </SaasAdminScreen>
  );
}


### 4.4 TenantConfigurationScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/tenants/tenant-configuration/TenantConfigurationScreen.tsx`)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, RotateCcw } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Select, Textarea, ErrorState } from "@components/common/ui";
import { useGetTenantQuery, useUpdateTenantMutation } from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface ConfigForm {
  name: string;
  industry: string;
  website: string;
  notes: string;
  primaryContactName: string;
  primaryContactEmail: string;
  timezone: string;
  locale: string;
}

const emptyForm: ConfigForm = {
  name: "",
  industry: "",
  website: "",
  notes: "",
  primaryContactName: "",
  primaryContactEmail: "",
  timezone: "UTC",
  locale: "en-US",
};

const timezones = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];
const locales = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES", "ja-JP", "zh-CN", "pt-BR"];

function toForm(tenant: ApiRecord): ConfigForm {
  return {
    name: String(tenant.name ?? ""),
    industry: String(tenant.industry ?? ""),
    website: String(tenant.website ?? ""),
    notes: String(tenant.notes ?? ""),
    primaryContactName: String(tenant.primaryContactName ?? ""),
    primaryContactEmail: String(tenant.primaryContactEmail ?? ""),
    timezone: String(tenant.timezone ?? "UTC"),
    locale: String(tenant.locale ?? "en-US"),
  };
}

export function TenantConfigurationScreen() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const tenantQuery = useGetTenantQuery(tenantId ?? "", { skip: !tenantId });
  const [updateTenant, { isLoading: saving }] = useUpdateTenantMutation();

  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ConfigForm, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tenant = tenantQuery.data?.data as ApiRecord | undefined;

  useEffect(() => {
    if (tenant) setForm(toForm(tenant));
  }, [tenant]);

  const handleChange = (field: keyof ConfigForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ConfigForm, string>> = {};
    if (!form.name.trim()) next.name = "Tenant name is required";
    else if (form.name.trim().length < 2) next.name = "Tenant name must be at least 2 characters";
    if (form.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContactEmail)) {
      next.primaryContactEmail = "Invalid email format";
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      next.website = "Website must be a valid URL (http:// or https://)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaveError(null);
    if (!tenantId || !validate()) return;
    try {
      await updateTenant({
        tenantId,
        body: {
          name: form.name.trim(),
          industry: form.industry.trim() || null,
          website: form.website.trim() || null,
          notes: form.notes.trim() || null,
          primaryContactName: form.primaryContactName.trim() || null,
          primaryContactEmail: form.primaryContactEmail.trim() || null,
          timezone: form.timezone,
          locale: form.locale,
        },
      }).unwrap();
      setMessage("Tenant configuration saved.");
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    }
  };

  const title = tenant ? String(tenant.name) : "Tenant Configuration";

  return (
    <SaasAdminScreen
      title={title}
      description="Update the tenant's organization and regional settings."
      backTo="/saas-admin/tenants/all-tenants"
      backLabel="Back to All Tenants"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management" },
        { label: "All Tenants", href: "/saas-admin/tenants/all-tenants" },
        { label: "Configuration" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => tenant && setForm(toForm(tenant))}><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
          <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
        </div>
      }
    >
      {tenantQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading tenant…</p>
      ) : tenantQuery.isError || !tenant ? (
        <ErrorState message="Could not load this tenant." />
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6" noValidate>
          {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
          {saveError ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{saveError}</div> : null}

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tenant Name" htmlFor="name">
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
              </Field>
              <Field label="Industry" htmlFor="industry">
                <Input id="industry" value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Technology" />
              </Field>
              <Field label="Website" htmlFor="website">
                <Input id="website" type="url" value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://acme.com" />
                {errors.website ? <p className="mt-1 text-xs text-red-600">{errors.website}</p> : null}
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Notes" htmlFor="notes">
                <Textarea id="notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Contact</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact Name" htmlFor="primaryContactName">
                <Input id="primaryContactName" value={form.primaryContactName} onChange={(e) => handleChange("primaryContactName", e.target.value)} />
              </Field>
              <Field label="Contact Email" htmlFor="primaryContactEmail">
                <Input id="primaryContactEmail" type="email" value={form.primaryContactEmail} onChange={(e) => handleChange("primaryContactEmail", e.target.value)} />
                {errors.primaryContactEmail ? <p className="mt-1 text-xs text-red-600">{errors.primaryContactEmail}</p> : null}
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Regional</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Timezone" htmlFor="timezone">
                <Select id="timezone" value={form.timezone} onChange={(e) => handleChange("timezone", e.target.value)}>
                  {timezones.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Locale" htmlFor="locale">
                <Select id="locale" value={form.locale} onChange={(e) => handleChange("locale", e.target.value)}>
                  {locales.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/tenants/all-tenants")}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
          </div>
        </form>
      )}
    </SaasAdminScreen>
  );
}


### 4.5 TenantStatusScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/tenants/tenant-status/TenantStatusScreen.tsx`)

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



---
## 5) Staff & Access Management (Explicit)

### 5.1 StaffAccountsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/staff-accounts/StaffAccountsScreen.tsx`)

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import { Plus, Eye, Edit, Shield, UserX, UserCheck, Clock, Activity, Users, CheckCircle, ShieldCheck } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, StatusBadge, StatCard } from "@/screens/saas-admin/components/ui";
import { Button, ErrorState } from "@components/common/ui";
import { cn } from "@utils/cn";
import { useListStaffQuery, useSuspendStaffMutation, useActivateStaffMutation, useRevokeStaffSessionsMutation } from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

interface Staff {
  id: string;
  name: string;
  email: string;
  roles: string[];
  jobTitle: string;
  status: "active" | "invited" | "disabled";
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

const statusOptions = ["active", "invited", "disabled"] as const;

function mapStatus(raw: unknown): Staff["status"] {
  const value = String(raw ?? "").toUpperCase();
  if (value === "ACTIVE") return "active";
  if (value === "INVITED") return "invited";
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

export function StaffAccountsScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListStaffQuery({ limit: 100 });
  const [suspendStaff] = useSuspendStaffMutation();
  const [activateStaff] = useActivateStaffMutation();
  const [revokeSessions] = useRevokeStaffSessionsMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const staff = useMemo(() => (data?.data ?? []).map(mapStaff), [data]);

  const roleOptions = useMemo(
    () => Array.from(new Set(staff.flatMap((member) => member.roles))).sort(),
    [staff],
  );

  const filteredStaff = useMemo(() => {
    return staff
      .filter((member) => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.jobTitle.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || member.status === statusFilter;
        const matchesRole = !roleFilter || member.roles.some((r) => r === roleFilter);
        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort((a, b) => {
        const aVal = a[sortBy as keyof Staff] ?? "";
        const bVal = b[sortBy as keyof Staff] ?? "";
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [staff, searchQuery, statusFilter, roleFilter, sortBy, sortOrder]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));

  const activeCount = staff.filter((s) => s.status === "active").length;
  const invitedCount = staff.filter((s) => s.status === "invited").length;
  const mfaEnabledCount = staff.filter((s) => s.mfaEnabled).length;

  const columns = [
    {
      key: "name",
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
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Staff) => <StatusBadge status={row.status} variant={row.status === "invited" ? "pending" : row.status} size="sm" />,
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
    if (sortBy === key) setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const actions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(SAAS_ADMIN_PATHS.staff.account(row.id)) },
    { label: "Edit", icon: <Edit className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(SAAS_ADMIN_PATHS.staff.edit(row.id)) },
    { label: "Roles", icon: <Shield className="h-3.5 w-3.5" />, onClick: (row: Staff) => navigate(`/saas-admin/staff-management/edit/${row.id}`) },
    { label: "Disable", icon: <UserX className="h-3.5 w-3.5" />, variant: "danger" as const, show: (row: Staff) => row.status === "active", onClick: (row: Staff) => void suspendStaff(row.id) },
    { label: "Enable", icon: <UserCheck className="h-3.5 w-3.5" />, show: (row: Staff) => row.status === "disabled", onClick: (row: Staff) => void activateStaff(row.id) },
    { label: "Revoke Sessions", icon: <Clock className="h-3.5 w-3.5" />, variant: "ghost" as const, show: (row: Staff) => row.status === "active", onClick: (row: Staff) => void revokeSessions(row.id) },
    { label: "Activity", icon: <Activity className="h-3.5 w-3.5" />, variant: "ghost" as const, onClick: (row: Staff) => navigate(`${SAAS_ADMIN_PATHS.staff.auditLogs}?staffId=${row.id}`) },
  ];

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
        <StatCard label="Total Staff" value={staff.length} color="info" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Active" value={activeCount} color="success" icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard label="Invited" value={invitedCount} color="warning" icon={<Clock className="h-6 w-6" />} />
        <StatCard label="MFA Enabled" value={mfaEnabledCount} color={mfaEnabledCount === staff.length && staff.length > 0 ? "success" : "warning"} icon={<Shield className="h-6 w-6" />} />
      </div>

      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, email, or job title..."
        filters={[
          { key: "status", label: "Status", type: "select", options: statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
          { key: "role", label: "Role", type: "select", options: roleOptions.map((r) => ({ value: r, label: r })) },
        ]}
        filterValues={{ status: statusFilter, role: roleFilter }}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value as string);
          else if (key === "role") setRoleFilter(value as string);
        }}
        onClearFilters={() => { setStatusFilter(""); setRoleFilter(""); }}
      />

      {isError ? (
        <ErrorState message="Could not load staff accounts." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paginatedStaff}
            rowKey={(row) => row.id}
            loading={isLoading}
            onRowClick={(row) => navigate(SAAS_ADMIN_PATHS.staff.account(row.id))}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selection={{ selectedKeys, onChange: setSelectedKeys, getKey: (row) => row.id }}
            actions={actions}
            emptyTitle="No staff found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </SaasAdminScreen>
  );
}


### 5.2 StaffDetailsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/staff-accounts/StaffDetailsScreen.tsx`)

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Activity,
  ArrowLeft,
  Clock,
  Edit,
  KeyRound,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { ConfirmDialog, DataTable, StatCard, StatusBadge } from "@/screens/saas-admin/components/ui";
import { SectionCard } from "@/screens/saas-admin/components/resource/SectionCard";
import { DetailsGrid } from "@/screens/saas-admin/components/resource/DetailsGrid";
import { formatDate } from "@/screens/saas-admin/components/resource/helpers";
import { Button, ErrorState } from "@components/common/ui";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import { apiErrorMessage } from "@services/http";
import {
  useActivateStaffMutation,
  useDeactivateStaffMutation,
  useGetStaffActivityQuery,
  useGetStaffQuery,
  useInviteStaffMutation,
  useResetStaffPasswordMutation,
  useRevokeStaffSessionsMutation,
  useSuspendStaffMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const BREADCRUMBS = [
  { label: "SaaS Admin" },
  { label: "Staff & Access" },
  { label: "Staff Accounts", href: SAAS_ADMIN_PATHS.staff.accounts },
  { label: "Staff Member" },
];

function staffName(record: ApiRecord | undefined): string {
  if (!record) return "Staff Member";
  const name = [record.firstName, record.lastName].filter(Boolean).join(" ");
  return String(record.displayName || name || record.email || "Staff Member");
}

function normalisedStatus(value: unknown): "active" | "invited" | "suspended" | "deactivated" {
  const status = String(value ?? "").toUpperCase();
  if (status === "ACTIVE") return "active";
  if (status === "INVITED") return "invited";
  if (status === "SUSPENDED") return "suspended";
  return "deactivated";
}

const STATUS_VARIANT: Record<string, "active" | "pending" | "suspended"> = {
  active: "active",
  invited: "pending",
  suspended: "suspended",
  deactivated: "suspended",
};

export function StaffDetailsScreen() {
  const { staffId } = useParams<{ staffId: string }>();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const staffQuery = useGetStaffQuery(staffId ?? "", { skip: !staffId });
  const activityQuery = useGetStaffActivityQuery({ staffId: staffId ?? "", limit: 20 }, { skip: !staffId });

  const [inviteStaff, { isLoading: inviting }] = useInviteStaffMutation();
  const [activateStaff, { isLoading: activating }] = useActivateStaffMutation();
  const [suspendStaff, { isLoading: suspending }] = useSuspendStaffMutation();
  const [deactivateStaff, { isLoading: deactivating }] = useDeactivateStaffMutation();
  const [resetPassword, { isLoading: resetting }] = useResetStaffPasswordMutation();
  const [revokeSessions, { isLoading: revoking }] = useRevokeStaffSessionsMutation();

  const staff = staffQuery.data?.data as ApiRecord | undefined;

  if (staffQuery.isLoading) {
    return (
      <SaasAdminScreen title="Staff Member" description="Loading staff member…" backTo={SAAS_ADMIN_PATHS.staff.accounts} backLabel="Back to Staff Accounts" breadcrumbs={BREADCRUMBS}>
        <p className="text-sm text-slate-500">Loading staff member…</p>
      </SaasAdminScreen>
    );
  }

  if (staffQuery.isError || !staff) {
    return (
      <SaasAdminScreen title="Staff Member" description="Staff details" backTo={SAAS_ADMIN_PATHS.staff.accounts} backLabel="Back to Staff Accounts" breadcrumbs={BREADCRUMBS}>
        <ErrorState message="Could not load this staff member." />
      </SaasAdminScreen>
    );
  }

  const status = normalisedStatus(staff.status);
  const roles = (Array.isArray(staff.roles) ? staff.roles : []) as ApiRecord[];
  const recentLogins = (Array.isArray(staff.recentLogins) ? staff.recentLogins : []) as ApiRecord[];
  const activity = ((activityQuery.data?.data ?? []) as ApiRecord[]).map((event) => ({
    id: String(event.id),
    action: String(event.action ?? "—"),
    resourceType: String(event.resourceType ?? "—"),
    resourceId: event.resourceId ? String(event.resourceId) : "",
    outcome: String(event.outcome ?? ""),
    createdAt: event.createdAt ? String(event.createdAt) : "",
  }));
  const activeSessions = Number(staff.activeSessions ?? 0);

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success(label);
      staffQuery.refetch();
      activityQuery.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const loginColumns = [
    { key: "outcome", header: "Outcome", render: (row: ApiRecord) => <StatusBadge status={String(row.outcome ?? "—").toLowerCase()} variant={String(row.outcome) === "SUCCESS" ? "active" : "suspended"} size="sm" /> },
    { key: "ipAddress", header: "IP Address", render: (row: ApiRecord) => <span className="text-sm text-slate-700">{String(row.ipAddress ?? "—")}</span> },
    { key: "userAgent", header: "Device", render: (row: ApiRecord) => <span className="text-xs text-slate-500">{String(row.userAgent ?? "—").slice(0, 60)}</span> },
    { key: "createdAt", header: "When", render: (row: ApiRecord) => <span className="text-sm text-slate-700">{formatDate(row.createdAt)}</span> },
  ];

  const activityColumns = [
    { key: "action", header: "Action", render: (row: (typeof activity)[number]) => <span className="font-mono text-xs text-slate-800">{row.action}</span> },
    { key: "resourceType", header: "Resource", render: (row: (typeof activity)[number]) => <span className="text-sm text-slate-700">{row.resourceType}{row.resourceId ? ` · ${row.resourceId.slice(0, 10)}…` : ""}</span> },
    {
      key: "outcome",
      header: "Outcome",
      render: (row: (typeof activity)[number]) => (
        <StatusBadge status={row.outcome.toLowerCase() || "—"} variant={row.outcome === "SUCCESS" ? "active" : row.outcome === "DENIED" ? "suspended" : "pending"} size="sm" />
      ),
    },
    { key: "createdAt", header: "When", render: (row: (typeof activity)[number]) => <span className="text-sm text-slate-700">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <SaasAdminScreen
      title={staffName(staff)}
      description={String(staff.email ?? "") + (staff.jobTitle ? ` · ${String(staff.jobTitle)}` : "")}
      backTo={SAAS_ADMIN_PATHS.staff.accounts}
      backLabel="Back to Staff Accounts"
      breadcrumbs={BREADCRUMBS}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to={SAAS_ADMIN_PATHS.staff.edit(staffId ?? "")}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          </Link>
          <Link to={SAAS_ADMIN_PATHS.staff.edit(staffId ?? "")}>
            <Button variant="outline"><Shield className="h-4 w-4 mr-2" /> Manage Roles</Button>
          </Link>
          {status === "invited" ? (
            <Button variant="outline" loading={inviting} onClick={() => void run("Invitation sent.", () => inviteStaff({ staffId: staffId! }).unwrap())}>
              <Mail className="h-4 w-4 mr-2" /> Resend Invitation
            </Button>
          ) : null}
          {status === "active" ? (
            <Button variant="outline" className="text-red-600 hover:bg-red-50" loading={suspending} onClick={() => void run("Staff member suspended.", () => suspendStaff(staffId!).unwrap())}>
              <UserX className="h-4 w-4 mr-2" /> Disable
            </Button>
          ) : null}
          {status === "suspended" || status === "deactivated" ? (
            <Button variant="outline" loading={activating} onClick={() => void run("Staff member activated.", () => activateStaff(staffId!).unwrap())}>
              <UserCheck className="h-4 w-4 mr-2" /> Activate
            </Button>
          ) : null}
          {status !== "deactivated" ? (
            <Button variant="ghost" loading={revoking} onClick={() => void run("Sessions revoked.", () => revokeSessions(staffId!).unwrap())}>
              <Clock className="h-4 w-4 mr-2" /> Revoke Sessions
            </Button>
          ) : null}
          <Button variant="ghost" loading={resetting} onClick={() => void run("Password reset email sent.", () => resetPassword(staffId!).unwrap())}>
            <KeyRound className="h-4 w-4 mr-2" /> Reset Password
          </Button>
          {status === "suspended" ? (
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDeactivate(true)}>
              <ArrowLeft className="h-4 w-4 mr-2 rotate-90" /> Deactivate
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Status" value={status.charAt(0).toUpperCase() + status.slice(1)} color={status === "active" ? "success" : status === "invited" ? "warning" : "default"} icon={<UserCheck className="h-6 w-6" />} />
        <StatCard label="MFA" value={staff.mfaEnabled ? "Enabled" : "Disabled"} color={staff.mfaEnabled ? "success" : "warning"} icon={<ShieldCheck className="h-6 w-6" />} />
        <StatCard label="Active Sessions" value={activeSessions} color="info" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Last Login" value={staff.lastLoginAt ? formatDate(staff.lastLoginAt) : "Never"} color="default" icon={<RefreshCw className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <SectionCard title="Details" className="lg:col-span-2">
          <DetailsGrid
            items={[
              { label: "Email", value: String(staff.email ?? "—") },
              { label: "Status", value: <StatusBadge status={status} variant={STATUS_VARIANT[status]} size="sm" /> },
              { label: "MFA", value: <StatusBadge status={staff.mfaEnabled ? "enabled" : "disabled"} variant={staff.mfaEnabled ? "active" : "suspended"} size="sm" /> },
              { label: "Email Verified", value: staff.emailVerifiedAt ? formatDate(staff.emailVerifiedAt) : "Pending" },
              { label: "Last Login", value: staff.lastLoginAt ? formatDate(staff.lastLoginAt) : "Never" },
              { label: "Active Sessions", value: activeSessions },
              { label: "Phone", value: String(staff.phone ?? "—") },
              { label: "Job Title", value: String(staff.jobTitle ?? "—") },
              { label: "Timezone", value: String(staff.timezone ?? "—") },
              { label: "Locale", value: String(staff.locale ?? "—") },
              { label: "Created", value: formatDate(staff.createdAt) },
              { label: "Updated", value: formatDate(staff.updatedAt) },
              ...(staff.lockedUntil ? [{ label: "Locked Until", value: <span className="text-red-600">{formatDate(staff.lockedUntil)}</span> }] : []),
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Email address, account status and password are managed through the actions above so privileged changes stay on the audited flows.
          </p>
        </SectionCard>

        <SectionCard title={`Roles (${roles.length})`}>
          {roles.length === 0 ? (
            <p className="text-sm text-slate-500">No roles assigned.</p>
          ) : (
            <ul className="space-y-2">
              {roles.map((role) => (
                <li key={String(role.id)} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <Link to={SAAS_ADMIN_PATHS.staff.role(String(role.id))} className="block truncate text-sm font-medium text-brand-700 hover:underline">
                      {String(role.name ?? role.key)}
                    </Link>
                    {role.description ? <p className="truncate text-xs text-slate-500">{String(role.description)}</p> : null}
                  </div>
                  <StatusBadge status={role.isSystem ? "system" : "custom"} variant={role.isSystem ? "default" : "pending"} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {recentLogins.length > 0 ? (
        <SectionCard title="Recent Sign-ins" className="mb-6">
          <DataTable columns={loginColumns} rows={recentLogins} rowKey={(row) => String(row.id)} emptyTitle="No sign-in history" emptyDescription="This account has not signed in yet." />
        </SectionCard>
      ) : null}

      <SectionCard title="Administrative Activity">
        <div className="mb-4 flex items-center gap-2 text-slate-400">
          <Activity className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide">Audit trail for this account</span>
        </div>
        {activityQuery.isError ? (
          <ErrorState message="Could not load activity for this staff member." />
        ) : (
          <DataTable columns={activityColumns} rows={activity} rowKey={(row) => row.id} loading={activityQuery.isLoading} emptyTitle="No activity" emptyDescription="No administrative actions recorded for this account." />
        )}
      </SectionCard>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          setConfirmDeactivate(false);
          await run("Staff member deactivated.", () => deactivateStaff(staffId!).unwrap());
        }}
        loading={deactivating}
        title="Deactivate Staff Account"
        message={`Deactivate ${staffName(staff)}? The account will lose access and all sessions will be revoked.`}
        confirmLabel="Deactivate"
        variant="danger"
      />
    </SaasAdminScreen>
  );
}


### 5.3 StaffEditScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/edit/StaffEditScreen.tsx`)

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Check, Save, Search, Shield, ShieldCheck, X } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState, Field, Input } from "@components/common/ui";
import { StatusBadge } from "@/screens/saas-admin/components/ui";
import { SectionCard } from "@/screens/saas-admin/components/resource/SectionCard";
import { DetailsGrid } from "@/screens/saas-admin/components/resource/DetailsGrid";
import { formatDate } from "@/screens/saas-admin/components/resource/helpers";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import {
  useGetStaffQuery,
  useListRolesQuery,
  useSetStaffRolesMutation,
  useUpdateStaffMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  jobTitle: string;
  timezone: string;
  locale: string;
}

interface RoleOption {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  isSystem: boolean;
}

const initialFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  displayName: "",
  phone: "",
  jobTitle: "",
  timezone: "",
  locale: "",
};

function mapRole(row: ApiRecord): RoleOption {
  return {
    id: String(row.id),
    name: String(row.name ?? row.key ?? "Untitled role"),
    description: typeof row.description === "string" ? row.description : "",
    permissionCount: Number(row.permissionCount ?? (Array.isArray(row.permissions) ? row.permissions.length : 0)),
    isSystem: Boolean(row.isSystem),
  };
}

export function StaffEditScreen() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const staffQuery = useGetStaffQuery(staffId ?? "", { skip: !staffId });
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const [updateStaff, { isLoading: savingProfile }] = useUpdateStaffMutation();
  const [setStaffRoles, { isLoading: savingRoles }] = useSetStaffRolesMutation();

  const staff = staffQuery.data?.data as ApiRecord | undefined;
  const allRoles = useMemo(() => ((rolesQuery.data?.data ?? []) as ApiRecord[]).map(mapRole), [rolesQuery.data]);

  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [initialForm, setInitialForm] = useState<StaffFormData>(initialFormData);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !staff) return;
    const next: StaffFormData = {
      firstName: String(staff.firstName ?? ""),
      lastName: String(staff.lastName ?? ""),
      displayName: String(staff.displayName ?? ""),
      phone: String(staff.phone ?? ""),
      jobTitle: String(staff.jobTitle ?? ""),
      timezone: String(staff.timezone ?? ""),
      locale: String(staff.locale ?? ""),
    };
    const roleIds = Array.isArray(staff.roleIds)
      ? (staff.roleIds as unknown[]).map(String)
      : ((staff.roles as ApiRecord[] | undefined) ?? []).map((role) => String(role.id));
    setFormData(next);
    setInitialForm(next);
    setSelectedRoleIds(roleIds);
    setInitialRoleIds(roleIds);
    setInitialized(true);
  }, [staff, initialized]);

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const profileDirty = useMemo(
    () => (Object.keys(initialForm) as (keyof StaffFormData)[]).some((key) => formData[key] !== initialForm[key]),
    [formData, initialForm],
  );

  const rolesDirty = useMemo(
    () => [...selectedRoleIds].sort().join(",") !== [...initialRoleIds].sort().join(","),
    [selectedRoleIds, initialRoleIds],
  );

  const dirty = profileDirty || rolesDirty;
  const saving = savingProfile || savingRoles;

  const selectedRoles = allRoles.filter((role) => selectedRoleIds.includes(role.id));
  const availableRoles = allRoles.filter(
    (role) => !selectedRoleIds.includes(role.id) && role.name.toLowerCase().includes(roleSearch.toLowerCase()),
  );
  const totalPermissions = selectedRoles.reduce((sum, role) => sum + role.permissionCount, 0);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof StaffFormData, string>> = {};
    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setSubmitError(null);
    if (!staffId || !validate()) return;
    try {
      if (profileDirty) {
        await updateStaff({
          staffId,
          body: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            displayName: formData.displayName.trim() || null,
            phone: formData.phone.trim() || null,
            jobTitle: formData.jobTitle.trim() || null,
            timezone: formData.timezone.trim() || undefined,
            locale: formData.locale.trim() || undefined,
          },
        }).unwrap();
      }
      if (rolesDirty) {
        await setStaffRoles({ staffId, body: { roleIds: selectedRoleIds } }).unwrap();
      }
      toast.success("Staff member updated.");
      navigate(SAAS_ADMIN_PATHS.staff.account(staffId));
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  const breadcrumbs = [
    { label: "SaaS Admin" },
    { label: "Staff & Access" },
    { label: "Staff Accounts", href: SAAS_ADMIN_PATHS.staff.accounts },
    { label: "Edit Staff" },
  ];

  if (staffQuery.isLoading || (!initialized && !staffQuery.isError)) {
    return (
      <SaasAdminScreen
        title="Edit Staff Member"
        description="Loading staff member…"
        backTo={staffId ? SAAS_ADMIN_PATHS.staff.account(staffId) : SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Member"
        breadcrumbs={breadcrumbs}
      >
        <p className="text-sm text-slate-500">Loading staff member…</p>
      </SaasAdminScreen>
    );
  }

  if (staffQuery.isError || !staff) {
    return (
      <SaasAdminScreen
        title="Edit Staff Member"
        description="Update staff profile, roles and permissions."
        backTo={SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Accounts"
        breadcrumbs={breadcrumbs}
      >
        <ErrorState message="Could not load this staff member." />
      </SaasAdminScreen>
    );
  }

  const target = SAAS_ADMIN_PATHS.staff.account(staffId ?? "");
  const status = String(staff.status ?? "").toUpperCase();

  return (
    <SaasAdminScreen
      title="Edit Staff Member"
      description={`Profile, account details, roles and permissions for ${String(staff.email ?? "this account")}.`}
      backTo={target}
      backLabel="Back to Staff Member"
      breadcrumbs={breadcrumbs}
      actions={
        <Button onClick={handleSubmit} loading={saving} disabled={!dirty && !saving}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        ) : null}

        <SectionCard title="Personal Information">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="First Name" htmlFor="firstName">
              <Input id="firstName" value={formData.firstName} onChange={(event) => handleChange("firstName", event.target.value)} required />
              {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <Input id="lastName" value={formData.lastName} onChange={(event) => handleChange("lastName", event.target.value)} required />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
            </Field>
            <Field label="Display Name" htmlFor="displayName">
              <Input id="displayName" value={formData.displayName} onChange={(event) => handleChange("displayName", event.target.value)} placeholder="Shown across the console" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" value={formData.phone} onChange={(event) => handleChange("phone", event.target.value)} placeholder="+1 555 0100" />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle">
              <Input id="jobTitle" value={formData.jobTitle} onChange={(event) => handleChange("jobTitle", event.target.value)} placeholder="Senior Support Engineer" />
            </Field>
            <Field label="Timezone" htmlFor="timezone">
              <Input id="timezone" value={formData.timezone} onChange={(event) => handleChange("timezone", event.target.value)} placeholder="Asia/Kolkata" />
            </Field>
            <Field label="Locale" htmlFor="locale">
              <Input id="locale" value={formData.locale} onChange={(event) => handleChange("locale", event.target.value)} placeholder="en-IN" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Account Overview">
          <DetailsGrid
            items={[
              { label: "Email", value: String(staff.email ?? "—") },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    status={status.toLowerCase() || "—"}
                    variant={status === "ACTIVE" ? "active" : status === "INVITED" ? "pending" : "suspended"}
                    size="sm"
                  />
                ),
              },
              { label: "MFA", value: <StatusBadge status={staff.mfaEnabled ? "enabled" : "disabled"} variant={staff.mfaEnabled ? "active" : "suspended"} size="sm" /> },
              { label: "Email Verified", value: staff.emailVerifiedAt ? formatDate(staff.emailVerifiedAt) : "Pending" },
              { label: "Last Login", value: staff.lastLoginAt ? formatDate(staff.lastLoginAt) : "Never" },
              { label: "Active Sessions", value: Number(staff.activeSessions ?? 0) },
              { label: "Created", value: formatDate(staff.createdAt) },
              { label: "Updated", value: formatDate(staff.updatedAt) },
              ...(staff.lockedUntil ? [{ label: "Locked Until", value: <span className="text-red-600">{formatDate(staff.lockedUntil)}</span> }] : []),
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Email address, account status and password are managed through the staff member&apos;s detail page so
            privileged changes stay on the audited flows.
          </p>
        </SectionCard>

        <SectionCard
          title="Roles & Permissions"
          description={`${selectedRoles.length} role${selectedRoles.length === 1 ? "" : "s"} selected · ${totalPermissions} permission${totalPermissions === 1 ? "" : "s"} granted`}
          actions={<Shield className="h-5 w-5 text-slate-400" />}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Assigned</h4>
              {selectedRoles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No roles assigned. Add a role from the right to grant access.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedRoles.map((role) => (
                    <li key={role.id} className="flex items-start justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-slate-900">
                          <ShieldCheck className="h-4 w-4 text-brand-600" />
                          {role.name}
                        </p>
                        {role.description ? <p className="mt-0.5 text-xs text-slate-500">{role.description}</p> : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {role.permissionCount} permission{role.permissionCount === 1 ? "" : "s"}
                          {role.isSystem ? " · system role" : " · custom role"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleIds((prev) => prev.filter((id) => id !== role.id))}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${role.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Available</h4>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles…"
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
                />
              </div>
              {rolesQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading roles…</p>
              ) : availableRoles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No more roles available.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {availableRoles.map((role) => (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleIds((prev) => (prev.includes(role.id) ? prev : [...prev, role.id]))}
                        className="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        <p className="flex items-center gap-2 font-medium text-slate-900">
                          <Check className="h-4 w-4 text-slate-400" />
                          {role.name}
                        </p>
                        {role.description ? <p className="mt-0.5 text-xs text-slate-500">{role.description}</p> : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {role.permissionCount} permission{role.permissionCount === 1 ? "" : "s"}
                          {role.isSystem ? " · system role" : " · custom role"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(target)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty && !saving}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}


### 5.4 CreateStaffScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/create-staff/CreateStaffScreen.tsx`)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Select } from "@components/common/ui";
import { useCreateStaffMutation, useListRolesQuery } from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffFormData {
  firstName: string;
  lastName: string;
  businessEmail: string;
  jobTitle: string;
  roleId: string;
}

const initialFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  businessEmail: "",
  jobTitle: "",
  roleId: "",
};

export function CreateStaffScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { data: rolesData } = useListRolesQuery({ limit: 100 });
  const roles = (rolesData?.data ?? []) as ApiRecord[];

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.businessEmail.trim()) newErrors.businessEmail = "Business email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) newErrors.businessEmail = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    try {
      await createStaff({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.businessEmail.trim(),
        jobTitle: formData.jobTitle.trim() || undefined,
        roleIds: formData.roleId ? [formData.roleId] : [],
      }).unwrap();
      navigate("/saas-admin/staff-management/staff-accounts");
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  return (
    <SaasAdminScreen
      title="Create Staff Account"
      description="Add a new platform staff member with appropriate roles and permissions."
      backTo="/saas-admin/staff-management/staff-accounts"
      backLabel="Back to Staff Accounts"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Staff Accounts", href: "/saas-admin/staff-management/staff-accounts" },
        { label: "Create Staff" },
      ]}
      actions={
        <Button onClick={handleSubmit} loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Account</Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" htmlFor="firstName">
              <Input id="firstName" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="John" required />
              {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Smith" required />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
            </Field>
            <Field label="Business Email" htmlFor="businessEmail">
              <Input id="businessEmail" type="email" value={formData.businessEmail} onChange={(e) => handleChange("businessEmail", e.target.value)} placeholder="john@platform.com" required />
              {errors.businessEmail ? <p className="mt-1 text-xs text-red-600">{errors.businessEmail}</p> : null}
            </Field>
            <Field label="Job Title" htmlFor="jobTitle">
              <Input id="jobTitle" value={formData.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} placeholder="Senior Support Engineer" />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Access & Permissions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assigned Role" htmlFor="roleId">
              <Select id="roleId" value={formData.roleId} onChange={(e) => handleChange("roleId", e.target.value)}>
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={String(role.id)} value={String(role.id)}>{String(role.name ?? role.key)}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-500">Determines base permissions. Can be modified after creation.</p>
            </Field>
          </div>
        </section>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-medium text-amber-800">Security Notice</h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 list-disc list-inside">
            <li>Never allow ordinary staff to create another Main SaaS Admin</li>
            <li>Do not grant staff the ability to assign themselves additional privileges</li>
            <li>A secure invitation will be sent to the business email</li>
            <li>Avoid collecting or emailing permanent plaintext passwords</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/staff-management/staff-accounts")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Staff Account</Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}


### 5.5 RolesManagementScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/roles-management/RolesManagementScreen.tsx`)

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


### 5.6 RoleDetailsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/roles-management/RoleDetailsScreen.tsx`)

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Key, Users, Trash2, Shield } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState } from "@components/common/ui";
import { StatusBadge, StatCard, DataTable, ConfirmDialog } from "@/screens/saas-admin/components/ui";
import { apiErrorMessage } from "@services/http";
import {
  useGetRoleQuery,
  useGetRolePermissionsQuery,
  useGetRoleMembersQuery,
  useDeleteRoleMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const BREADCRUMBS = [
  { label: "SaaS Admin" },
  { label: "Staff & Access" },
  { label: "Roles Management", href: "/saas-admin/staff-management/roles" },
  { label: "Role" },
];

function fmt(value: unknown): string {
  return value ? new Date(String(value)).toLocaleString() : "—";
}

export function RoleDetailsScreen() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleQuery = useGetRoleQuery(roleId ?? "", { skip: !roleId });
  const permissionsQuery = useGetRolePermissionsQuery(roleId ?? "", { skip: !roleId });
  const membersQuery = useGetRoleMembersQuery({ roleId: roleId ?? "", limit: 100 }, { skip: !roleId });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const role = roleQuery.data?.data as ApiRecord | undefined;
  const permissionsPayload = permissionsQuery.data?.data as ApiRecord | undefined;
  const permissionItems = (permissionsPayload?.permissions ?? []) as ApiRecord[];
  const members = ((membersQuery.data?.data ?? []) as ApiRecord[]).map((row) => ({
    id: String(row.id ?? row.assignmentId),
    name: String(row.displayName ?? ([row.firstName, row.lastName].filter(Boolean).join(" ") || row.email || "—")),
    email: String(row.email ?? ""),
    jobTitle: String(row.jobTitle ?? ""),
    status: String(row.status ?? ""),
    assignedAt: row.assignedAt ? String(row.assignedAt) : "",
  }));

  const grouped = permissionItems.reduce<Record<string, ApiRecord[]>>((acc, item) => {
    const module = String(item.module ?? "other");
    (acc[module] ??= []).push(item);
    return acc;
  }, {});

  if (roleQuery.isLoading) {
    return (
      <SaasAdminScreen title="Role" description="Loading role…" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={BREADCRUMBS}>
        <p className="text-sm text-slate-500">Loading role…</p>
      </SaasAdminScreen>
    );
  }

  if (roleQuery.isError || !role) {
    return (
      <SaasAdminScreen title="Role" description="Role details" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={BREADCRUMBS}>
        <ErrorState message="Could not load this role." />
      </SaasAdminScreen>
    );
  }

  const name = String(role.name ?? role.key ?? "Role");
  const isSystem = Boolean(role.isSystem);
  const memberCount = Number(role.memberCount ?? members.length);

  const handleDelete = async () => {
    if (!roleId) return;
    setError(null);
    try {
      await deleteRole(roleId).unwrap();
      navigate("/saas-admin/staff-management/roles");
    } catch (err) {
      setError(apiErrorMessage(err));
      setConfirmDelete(false);
    }
  };

  const memberColumns = [
    { key: "name", header: "Name", render: (m: typeof members[number]) => <span className="font-medium text-slate-900">{m.name}</span> },
    { key: "email", header: "Email", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.email}</span> },
    { key: "jobTitle", header: "Job Title", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.jobTitle || "—"}</span> },
    { key: "status", header: "Status", render: (m: typeof members[number]) => <StatusBadge status={m.status.toLowerCase()} variant={m.status.toUpperCase() === "ACTIVE" ? "active" : "pending"} size="sm" /> },
    { key: "assignedAt", header: "Assigned", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.assignedAt ? new Date(m.assignedAt).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <SaasAdminScreen
      title={name}
      description={String(role.description || "Platform role")}
      backTo="/saas-admin/staff-management/roles"
      backLabel="Back to Roles"
      breadcrumbs={BREADCRUMBS}
      actions={
        <div className="flex gap-2">
          <Link to={`/saas-admin/staff-management/roles/edit/${roleId}`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          </Link>
          <Link to={`/saas-admin/staff-management/roles/edit/${roleId}`}>
            <Button variant="outline"><Key className="h-4 w-4 mr-2" /> Manage Permissions</Button>
          </Link>
          {!isSystem && memberCount === 0 ? (
            <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          ) : null}
        </div>
      }
    >
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Type" value={isSystem ? "System" : "Custom"} color={isSystem ? "default" : "warning"} icon={<Shield className="h-6 w-6" />} />
        <StatCard label="Members" value={memberCount} color="info" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Permissions" value={permissionItems.length} color="success" icon={<Key className="h-6 w-6" />} />
        <StatCard label="Updated" value={role.updatedAt ? new Date(String(role.updatedAt)).toLocaleDateString() : "—"} color="default" icon={<Edit className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Key</dt><dd className="font-mono text-right break-all">{String(role.key ?? "—")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd><StatusBadge status={isSystem ? "system" : "custom"} variant={isSystem ? "default" : "pending"} size="sm" /></dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="font-medium">{fmt(role.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd className="font-medium">{fmt(role.updatedAt)}</dd></div>
          </dl>
          {role.description ? <p className="mt-4 text-sm text-slate-600">{String(role.description)}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissions ({permissionItems.length})</h3>
          {permissionsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading permissions…</p>
          ) : permissionItems.length === 0 ? (
            <p className="text-sm text-slate-500">This role has no permissions granted.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([module, items]) => (
                <div key={module}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{module}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span key={String(item.code)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700" title={String(item.description ?? "")}>
                        {String(item.name ?? item.code)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Members ({memberCount})</h3>
        {membersQuery.isError ? (
          <ErrorState message="Could not load role members." />
        ) : (
          <DataTable columns={memberColumns} rows={members} rowKey={(m) => m.id} loading={membersQuery.isLoading} emptyTitle="No members" emptyDescription="No staff are assigned to this role." />
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </SaasAdminScreen>
  );
}


### 5.7 RoleFormScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/roles-management/RoleFormScreen.tsx`)

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Shield, Search } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Textarea, ErrorState } from "@components/common/ui";
import { apiErrorMessage } from "@services/http";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  usePermissionGroupsQuery,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

interface PermissionItem {
  code: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  items: PermissionItem[];
}

const KEY_PATTERN = /^[a-z0-9](-?[a-z0-9])*$/;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function RoleFormScreen() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(roleId);

  const roleQuery = useGetRoleQuery(roleId ?? "", { skip: !isEdit });
  const permissionsQuery = useGetRolePermissionsQuery(roleId ?? "", { skip: !isEdit });
  const groupsQuery = usePermissionGroupsQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [setRolePermissions, { isLoading: settingPerms }] = useSetRolePermissionsMutation();

  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [originalCodes, setOriginalCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const role = roleQuery.data?.data as ApiRecord | undefined;
  const isSystem = Boolean(role?.isSystem);

  useEffect(() => {
    if (!isEdit || loaded || !role) return;
    setKey(String(role.key ?? ""));
    setKeyTouched(true);
    setName(String(role.name ?? ""));
    setDescription(String(role.description ?? ""));
    setLoaded(true);
  }, [isEdit, loaded, role]);

  useEffect(() => {
    const payload = permissionsQuery.data?.data as ApiRecord | undefined;
    if (!isEdit || !payload) return;
    const codes = (payload.permissionCodes as string[] | undefined) ?? [];
    setOriginalCodes(codes);
    setSelected(new Set(codes));
  }, [isEdit, permissionsQuery.data]);

  const groups: PermissionGroup[] = useMemo(
    () =>
      ((groupsQuery.data?.data ?? []) as ApiRecord[]).map((group) => ({
        module: String(group.module ?? "Other"),
        items: ((group.items ?? []) as ApiRecord[]).map((item) => ({
          code: String(item.code ?? item.id),
          name: String(item.name ?? item.code ?? ""),
          description: typeof item.description === "string" ? item.description : "",
        })),
      })),
    [groupsQuery.data],
  );

  const permissionsDirty = useMemo(() => {
    if (!isEdit) return selected.size > 0;
    if (originalCodes.length !== selected.size) return true;
    return originalCodes.some((code) => !selected.has(code));
  }, [isEdit, originalCodes, selected]);

  const saving = creating || updating || settingPerms;
  const term = search.toLowerCase();
  const visibleGroups = groups
    .map((group) => {
      if (!term) return group;
      if (group.module.toLowerCase().includes(term)) return group;
      return { ...group, items: group.items.filter((item) => item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term)) };
    })
    .filter((group) => group.items.length > 0);

  const toggle = (code: string) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (group: PermissionGroup, value: boolean) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      group.items.forEach((item) => (value ? next.add(item.code) : next.delete(item.code)));
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && !keyTouched) setKey(slugify(value));
    setErrors((prev) => ({ ...prev, name: "" }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Role name is required";
    else if (name.trim().length < 2) next.name = "Role name must be at least 2 characters";
    if (!isEdit && !key.trim()) next.key = "Role key is required";
    else if (!isEdit && !KEY_PATTERN.test(key.trim())) next.key = "Key must be a lowercase slug (letters, numbers, single hyphens)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaveError(null);
    if (!validate()) return;
    try {
      if (!isEdit) {
        await createRole({
          key: key.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          permissionCodes: Array.from(selected),
        }).unwrap();
        navigate("/saas-admin/staff-management/roles");
        return;
      }
      if (!roleId) return;
      const body: ApiRecord = { name: name.trim(), description: description.trim() || null };
      if (!isSystem && key.trim() !== String(role?.key ?? "")) body.key = key.trim();
      await updateRole({ roleId, body }).unwrap();
      if (permissionsDirty) {
        await setRolePermissions({ roleId, body: { permissionCodes: Array.from(selected) } }).unwrap();
      }
      setMessage("Role saved.");
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    }
  };

  if (isEdit && roleQuery.isLoading) {
    return (
      <SaasAdminScreen title="Edit Role" description="Loading role…" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: "Edit" }]}>
        <p className="text-sm text-slate-500">Loading role…</p>
      </SaasAdminScreen>
    );
  }

  if (isEdit && (roleQuery.isError || !role)) {
    return (
      <SaasAdminScreen title="Edit Role" description="Role details" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: "Edit" }]}>
        <ErrorState message="Could not load this role." />
      </SaasAdminScreen>
    );
  }

  if (groupsQuery.isError) {
    return (
      <SaasAdminScreen title={isEdit ? "Edit Role" : "Create Role"} description="Configure the role and its permissions." backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: isEdit ? "Edit" : "Create" }]}>
        <ErrorState message="Could not load the permission catalog." />
      </SaasAdminScreen>
    );
  }

  return (
    <SaasAdminScreen
      title={isEdit ? `Edit ${name || "Role"}` : "Create Role"}
      description="Configure the role and its permission grants."
      backTo="/saas-admin/staff-management/roles"
      backLabel="Back to Roles"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Roles Management", href: "/saas-admin/staff-management/roles" },
        { label: isEdit ? "Edit" : "Create" },
      ]}
      actions={
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Role"}
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
        {saveError ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div> : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Role</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role Name" htmlFor="role-name">
              <Input id="role-name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </Field>
            <Field label="Role Key" htmlFor="role-key">
              <Input id="role-key" value={key} onChange={(e) => { setKey(e.target.value.toLowerCase()); setKeyTouched(true); setErrors((prev) => ({ ...prev, key: "" })); }} disabled={isSystem} className={isSystem ? "bg-slate-100" : undefined} />
              {errors.key ? <p className="mt-1 text-xs text-red-600">{errors.key}</p> : null}
              {isSystem ? <p className="mt-1 text-xs text-slate-400">System role keys cannot be changed.</p> : null}
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description" htmlFor="role-description">
              <Textarea id="role-description" value={description} onChange={(e) => { setDescription(e.target.value); setMessage(null); }} rows={3} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Permissions ({selected.size})</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {groupsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading permission catalog…</p>
          ) : (
            <div className="space-y-6">
              {visibleGroups.map((group) => {
                const allSelected = group.items.every((item) => selected.has(item.code));
                return (
                  <div key={group.module}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-800 capitalize">{group.module}</h4>
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4" checked={allSelected} onChange={(e) => toggleModule(group, e.target.checked)} />
                        Select all
                      </label>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => (
                        <label key={item.code} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={selected.has(item.code)} onChange={() => toggle(item.code)} />
                          <span className="text-sm">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            <span className="block font-mono text-xs text-slate-400">{item.code}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500"><Shield className="h-4 w-4 inline mr-1" /> Permissions are enforced by the backend on every protected operation.</p>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/staff-management/roles")}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Role"}</Button>
          </div>
        </div>
      </form>
    </SaasAdminScreen>
  );
}


### 5.8 PermissionsManagementScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/permissions-management/PermissionsManagementScreen.tsx`)

import { useEffect, useMemo, useState } from "react";
import { Save, Shield, Search } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Select, ErrorState } from "@components/common/ui";
import {
  useListRolesQuery,
  usePermissionGroupsQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface PermissionItem {
  code: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  items: PermissionItem[];
}

export function PermissionsManagementScreen() {
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const groupsQuery = usePermissionGroupsQuery();

  const roles = (rolesQuery.data?.data ?? []) as ApiRecord[];
  const groups: PermissionGroup[] = useMemo(
    () =>
      ((groupsQuery.data?.data ?? []) as ApiRecord[]).map((group) => ({
        module: String(group.module ?? "Other"),
        items: ((group.items ?? []) as ApiRecord[]).map((item) => ({
          code: String(item.code ?? item.id),
          name: String(item.name ?? item.code ?? ""),
          description: typeof item.description === "string" ? item.description : "",
        })),
      })),
    [groupsQuery.data],
  );

  const [roleId, setRoleId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionsQuery = useGetRolePermissionsQuery(roleId, { skip: !roleId });
  const [setRolePermissions, { isLoading: saving }] = useSetRolePermissionsMutation();

  useEffect(() => {
    if (!roleId && roles.length > 0) setRoleId(String(roles[0].id));
  }, [roles, roleId]);

  const originalCodes = useMemo<string[]>(() => {
    const payload = permissionsQuery.data?.data as ApiRecord | undefined;
    return (payload?.permissionCodes as string[] | undefined) ?? [];
  }, [permissionsQuery.data]);

  useEffect(() => {
    setSelected(new Set(originalCodes));
  }, [originalCodes]);

  const dirty = useMemo(() => {
    if (originalCodes.length !== selected.size) return roleId !== "";
    return originalCodes.some((code) => !selected.has(code));
  }, [originalCodes, selected, roleId]);

  const toggle = (code: string) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (module: PermissionGroup, value: boolean) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      module.items.forEach((item) => (value ? next.add(item.code) : next.delete(item.code)));
      return next;
    });
  };

  const handleSave = async () => {
    if (!roleId) return;
    setError(null);
    setMessage(null);
    try {
      await setRolePermissions({ roleId, body: { permissionCodes: Array.from(selected) } }).unwrap();
      setMessage("Role permissions updated.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  if (rolesQuery.isError || groupsQuery.isError) {
    return (
      <SaasAdminScreen
        title="Permissions Management"
        description="Configure the permission grants for a platform role."
        breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Permissions" }]}
      >
        <ErrorState message="Could not load the permission catalog." />
      </SaasAdminScreen>
    );
  }

  const term = search.toLowerCase();
  const visibleGroups = groups
    .map((group) => {
      if (!term) return group;
      if (group.module.toLowerCase().includes(term)) return group;
      return { ...group, items: group.items.filter((item) => item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term)) };
    })
    .filter((group) => group.items.length > 0);

  return (
    <SaasAdminScreen
      title="Permissions Management"
      description="Configure the permission grants for a platform role."
      breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Permissions" }]}
      actions={
        <Button onClick={handleSave} loading={saving} disabled={!dirty || !roleId}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      }
    >
      {message ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Role</span>
          <Select value={roleId} onChange={(e) => { setRoleId(e.target.value); setMessage(null); setError(null); }} className="min-w-64">
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={String(role.id)} value={String(role.id)}>{String(role.name ?? role.key)}</option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Filter</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </label>
        <span className="ml-auto text-sm text-slate-500">{selected.size} permission{selected.size === 1 ? "" : "s"} selected</span>
      </div>

      {!roleId ? (
        <p className="text-sm text-slate-500">Select a role to view and edit its permissions.</p>
      ) : permissionsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading permissions…</p>
      ) : (
        <div className="space-y-6">
          {visibleGroups.map((group) => {
            const allSelected = group.items.every((item) => selected.has(item.code));
            return (
              <section key={group.module} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-900">{group.module}</h3>
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4" checked={allSelected} onChange={(e) => toggleModule(group, e.target.checked)} />
                    Select all
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <label key={item.code} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={selected.has(item.code)}
                        onChange={() => toggle(item.code)}
                      />
                      <span className="text-sm">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="block font-mono text-xs text-slate-400">{item.code}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-700">
        <Shield className="h-4 w-4 inline mr-2" />
        <strong>Note:</strong> Permissions are enforced by the backend on every protected operation. Editing a system role may require additional privileges.
      </div>
    </SaasAdminScreen>
  );
}


### 5.9 RoleAssignmentScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/role-assignment/RoleAssignmentScreen.tsx`)

import { useEffect, useMemo, useState } from "react";
import { Check, Search, Shield, X } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState } from "@components/common/ui";
import {
  useListStaffQuery,
  useListRolesQuery,
  useSetStaffRolesMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffOption {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
}

interface RoleOption {
  id: string;
  name: string;
  description: string;
}

function mapStaff(row: ApiRecord): StaffOption {
  const name =
    (typeof row.displayName === "string" && row.displayName) ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    String(row.email ?? "Unknown");
  return {
    id: String(row.id),
    name,
    email: String(row.email ?? ""),
    roleIds: Array.isArray(row.roleIds) ? (row.roleIds as unknown[]).map(String) : [],
  };
}

function mapRole(row: ApiRecord): RoleOption {
  return {
    id: String(row.id),
    name: String(row.name ?? row.key ?? "Untitled role"),
    description: typeof row.description === "string" ? row.description : "",
  };
}

export function RoleAssignmentScreen() {
  const staffQuery = useListStaffQuery({ limit: 100 });
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const [setStaffRoles, { isLoading: saving }] = useSetStaffRolesMutation();

  const staff = useMemo(() => (staffQuery.data?.data ?? []).map(mapStaff), [staffQuery.data]);
  const roles = useMemo(() => (rolesQuery.data?.data ?? []).map(mapRole), [rolesQuery.data]);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [pendingRoleIds, setPendingRoleIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStaff = staff.find((member) => member.id === selectedStaffId) ?? null;

  useEffect(() => {
    if (!selectedStaffId && staff.length > 0) setSelectedStaffId(staff[0].id);
  }, [staff, selectedStaffId]);

  useEffect(() => {
    if (selectedStaff) setPendingRoleIds(selectedStaff.roleIds);
  }, [selectedStaff]);

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(staffSearch.toLowerCase()),
  );

  const currentRoles = roles.filter((role) => pendingRoleIds.includes(role.id));
  const availableRoles = roles.filter(
    (role) => !pendingRoleIds.includes(role.id) && role.name.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const dirty = selectedStaff
    ? [...pendingRoleIds].sort().join(",") !== [...selectedStaff.roleIds].sort().join(",")
    : false;

  const addRole = (roleId: string) => {
    setMessage(null);
    setPendingRoleIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
  };

  const removeRole = (roleId: string) => {
    setMessage(null);
    setPendingRoleIds((prev) => prev.filter((id) => id !== roleId));
  };

  const handleSave = async () => {
    if (!selectedStaff) return;
    setError(null);
    setMessage(null);
    try {
      await setStaffRoles({ staffId: selectedStaff.id, body: { roleIds: pendingRoleIds } }).unwrap();
      setMessage("Role assignments saved.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  if (staffQuery.isError || rolesQuery.isError) {
    return (
      <SaasAdminScreen
        title="Staff Role Assignment"
        description="Search and select a staff member to manage their role assignments."
        breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Role Assignment" }]}
      >
        <ErrorState message="Could not load staff or roles." />
      </SaasAdminScreen>
    );
  }

  return (
    <SaasAdminScreen
      title="Staff Role Assignment"
      description="Search and select a staff member to manage their role assignments."
      breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Role Assignment" }]}
      actions={
        <Button onClick={handleSave} loading={saving} disabled={!dirty}>
          <Check className="h-4 w-4 mr-2" /> Save Assignments
        </Button>
      }
    >
      {message ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Staff Member</h3>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {staffQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading staff…</p>
            ) : filteredStaff.length === 0 ? (
              <p className="text-sm text-slate-500">No staff found.</p>
            ) : (
              filteredStaff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => { setSelectedStaffId(member.id); setMessage(null); setError(null); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${member.id === selectedStaffId ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Assigned Roles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {currentRoles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No roles assigned</p>
            ) : (
              currentRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">{role.name}</span>
                  <button onClick={() => removeRole(role.id)} className="text-red-600 hover:text-red-800" aria-label={`Remove ${role.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Roles</h3>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {rolesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading roles…</p>
            ) : availableRoles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No roles available</p>
            ) : (
              availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => addRole(role.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    {role.name}
                  </p>
                  {role.description ? <p className="text-xs text-slate-500 mt-1">{role.description}</p> : null}
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </SaasAdminScreen>
  );
}


### 5.10 AccessAuditLogsScreen.tsx (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/staff-management/access-audit-logs/AccessAuditLogsScreen.tsx`)

import { useMemo, useState } from "react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { DataTable, SearchFilters, Pagination, StatusBadge } from "@/screens/saas-admin/components/ui";
import { ErrorState } from "@components/common/ui";
import { useListAuditEventsQuery } from "@services/saasadmin";
import type { ApiRecord, ListQuery } from "@services/saasadmin";

const outcomeOptions = ["SUCCESS", "FAILURE", "DENIED"] as const;

interface AuditRow {
  id: string;
  createdAt: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: "success" | "failure" | "denied";
  ipAddress: string;
  requestId: string;
}

function mapOutcome(raw: unknown): AuditRow["outcome"] {
  const value = String(raw ?? "").toUpperCase();
  if (value === "FAILURE") return "failure";
  if (value === "DENIED") return "denied";
  return "success";
}

function mapRow(row: ApiRecord): AuditRow {
  const actor = (row.actor ?? null) as ApiRecord | null;
  const actorName = actor
    ? [actor.firstName, actor.lastName].filter(Boolean).join(" ") || String(actor.email ?? "")
    : "";
  return {
    id: String(row.id),
    createdAt: row.createdAt ? String(row.createdAt) : "",
    actorEmail: String((actor?.email ?? row.actorEmail) ?? ""),
    actorName,
    action: String(row.action ?? ""),
    resourceType: String(row.resourceType ?? ""),
    resourceId: String(row.resourceId ?? ""),
    outcome: mapOutcome(row.outcome),
    ipAddress: String(row.ipAddress ?? ""),
    requestId: String(row.requestId ?? ""),
  };
}

export function AccessAuditLogsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = useMemo<ListQuery>(() => ({
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
    ...(dateFrom ? { from: dateFrom } : {}),
    ...(dateTo ? { to: dateTo } : {}),
  }), [currentPage, itemsPerPage, sortBy, sortOrder, searchQuery, outcomeFilter, dateFrom, dateTo]);

  const { data, isLoading, isError } = useListAuditEventsQuery(params);

  const rows = ((data?.data ?? []) as ApiRecord[]).map(mapRow);
  const totalItems = Number((data?.meta as { total?: number } | undefined)?.total ?? rows.length);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const columns = [
    { key: "createdAt", header: "Timestamp", render: (r: AuditRow) => <span className="text-sm font-mono">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</span>, sortable: true },
    {
      key: "actorEmail",
      header: "Actor",
      render: (r: AuditRow) => (
        <div>
          <p className="font-medium text-slate-900">{r.actorName || r.actorEmail || "system"}</p>
          {r.actorName && r.actorEmail ? <p className="text-xs text-slate-500">{r.actorEmail}</p> : null}
        </div>
      ),
      sortable: false,
    },
    { key: "action", header: "Action", render: (r: AuditRow) => <StatusBadge status={r.action || "—"} variant="default" size="sm" />, sortable: false },
    {
      key: "resourceType",
      header: "Resource",
      render: (r: AuditRow) => (
        <div>
          <p className="text-sm text-slate-700">{r.resourceType || "—"}</p>
          {r.resourceId ? <p className="text-xs text-slate-400 font-mono truncate max-w-[16rem]">{r.resourceId}</p> : null}
        </div>
      ),
      sortable: false,
    },
    { key: "outcome", header: "Outcome", render: (r: AuditRow) => <StatusBadge status={r.outcome} variant={r.outcome === "success" ? "active" : "default"} size="sm" />, sortable: false },
    { key: "ipAddress", header: "Source IP", render: (r: AuditRow) => <span className="font-mono text-sm">{r.ipAddress || "—"}</span>, sortable: false },
    { key: "requestId", header: "Request ID", render: (r: AuditRow) => <span className="font-mono text-xs text-slate-500">{r.requestId || "—"}</span>, sortable: false },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortOrder("asc"); }
    setCurrentPage(1);
  };

  return (
    <SaasAdminScreen
      title="Access Audit Logs"
      description="View privileged action audit trail for staff accounts."
      breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Access Audit Logs" }]}
    >
      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={(value) => { setSearchQuery(value); setCurrentPage(1); }}
        placeholder="Search by actor, action, resource, or request ID..."
        filters={[
          { key: "outcome", label: "Outcome", type: "select", options: outcomeOptions.map((o) => ({ value: o, label: o.charAt(0) + o.slice(1).toLowerCase() })) },
          { key: "dateFrom", label: "From Date", type: "date" },
          { key: "dateTo", label: "To Date", type: "date" },
        ]}
        filterValues={{ outcome: outcomeFilter, dateFrom, dateTo }}
        onFilterChange={(k, v) => {
          setCurrentPage(1);
          if (k === "outcome") setOutcomeFilter(v as string);
          else if (k === "dateFrom") setDateFrom(v as string);
          else if (k === "dateTo") setDateTo(v as string);
        }}
        onClearFilters={() => { setOutcomeFilter(""); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
      />

      {isError ? (
        <ErrorState message="Could not load audit events." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyTitle="No audit events found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        </>
      )}
    </SaasAdminScreen>
  );
}



---
## 6) My Account (Explicit)

### 6.1 ChangePasswordScreen (`/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/ChangePasswordScreen.tsx`)

import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { SaasAdminScreen } from "../components/SaasAdminScreen";
import { Button } from "@components/common/ui";
import { apiErrorMessage, useChangePasswordMutation } from "@services/auth";

const fieldClass =
  "block w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none";

export function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [change] = useChangePasswordMutation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await change({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (cause) {
      const message = apiErrorMessage((cause as { data?: unknown }).data);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SaasAdminScreen
      title="Change Password"
      description="Update the password you use to sign in to the platform."
      breadcrumbs={[{ label: "SaaS Admin" }, { label: "My Account" }, { label: "Change Password" }]}
    >
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-slate-700">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </SaasAdminScreen>
  );
}


---
## 7) Config-Driven Resource: approvals.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/approvals.tsx`

import { ClipboardCheck, ShieldCheck, Workflow, ClipboardList } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListApprovalRequestsQuery,
  useMyPendingApprovalsQuery,
  useListApprovalPoliciesQuery,
  useCreateApprovalPolicyMutation,
} from "@services/saasadmin";

const SECTION = "Approval Management";

const REQUEST_STATUS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

const requestColumns: ResourceListConfig["columns"] = [
  { key: "id", header: "Request", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.requestId ?? "—").toString().slice(0, 8))}</span> },
  { key: "actionKey", header: "Action", render: (r) => <span className="font-mono text-xs">{String(r.actionKey ?? "—")}</span> },
  textCol("resourceType", "Resource"),
  textCol("resourceId", "Resource ID"),
  statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
  textCol("requestedBy.email", "Requested By"),
  dateCol("expiresAt", "Expires"),
];

export const APPROVAL_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/approval-management/pending",
    title: "Pending Approvals",
    description: "Approval requests awaiting your decision.",
    sectionLabel: SECTION,
    rowId: "requestId",
    source: { kind: "api", useList: asQueryHook(useMyPendingApprovalsQuery) },
    columns: requestColumns,
    searchable: (r) => `${r.actionKey} ${r.resourceType} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: REQUEST_STATUS, placeholder: "All statuses" }],
    stats: [
      { key: "total", label: "Pending", compute: (rows) => rows.length, icon: <ClipboardCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/policies",
    title: "Approval Policies",
    description: "Policies that control which actions require approval.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListApprovalPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      { key: "actionScope", header: "Action Scope", render: (r) => <span className="font-mono text-xs">{String(r.actionScope ?? "—")}</span> },
      textCol("description", "Description"),
      textCol("conditions", "Conditions"),
      textCol("minApprovals", "Min Approvals"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description} ${r.actionScope}`,
    create: {
      title: "Create Approval Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "actionScope", label: "Action Scope", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "minApprovals", label: "Min Approvals", type: "number" },
      ],
      useCreate: asMutationHook(useCreateApprovalPolicyMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/workflows",
    title: "Approval Workflows",
    description: "Policy-driven approval workflows (policies define routing and thresholds).",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListApprovalPoliciesQuery) },
    columns: [
      textCol("name", "Workflow"),
      textCol("actionScope", "Scope"),
      textCol("minApprovals", "Min Approvals"),
      textCol("approverRoleIds", "Approver Roles"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.actionScope}`,
    stats: [
      { key: "total", label: "Workflows", compute: (rows) => rows.length, icon: <Workflow className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/history",
    title: "Approval History",
    description: "All approval requests and their outcomes.",
    sectionLabel: SECTION,
    rowId: "requestId",
    source: { kind: "api", useList: asQueryHook(useListApprovalRequestsQuery) },
    columns: requestColumns,
    searchable: (r) => `${r.actionKey} ${r.resourceType} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: REQUEST_STATUS, placeholder: "All statuses" }],
    stats: [
      { key: "total", label: "Requests", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "approved", label: "Approved", compute: (rows) => rows.filter((r) => r.status === "APPROVED").length, color: "success", icon: <ClipboardList className="h-5 w-5" /> },
      { key: "rejected", label: "Rejected", compute: (rows) => rows.filter((r) => r.status === "REJECTED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: cmdbAssets.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/cmdbAssets.tsx`

import { Settings, Boxes, Package, RefreshCw } from "lucide-react";
import { asQueryHook, asMutationHook } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol } from "./columns";
import {
  useListCiTypesQuery,
  useCreateCiTypeMutation,
  useListAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useListRelationshipTypesQuery,
  useCreateRelationshipTypeMutation,
  useListDiscoveryProfilesQuery,
  useCreateDiscoveryProfileMutation,
} from "@services/saasadmin";

const SECTION = "CMDB & Asset Management";

export const CMDB_ASSET_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/cmdb-asset-management/cmdb-config",
    title: "CMDB Configuration",
    description: "Discovery profiles that define how configuration items are discovered and synced.",
    sectionLabel: SECTION,
    rowId: "profileId",
    source: { kind: "api", useList: asQueryHook(useListDiscoveryProfilesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Profile"),
      textCol("mode", "Mode"),
      textCol("schedule", "Schedule"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.mode}`,
    create: {
      title: "Create Discovery Profile",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "mode", label: "Mode", type: "text" },
        { key: "schedule", label: "Schedule", type: "text" },
      ],
      useCreate: asMutationHook(useCreateDiscoveryProfileMutation),
    },
    stats: [
      { key: "total", label: "Profiles", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/ci-types",
    title: "CI Types",
    description: "Configuration item types that define the CMDB schema.",
    sectionLabel: SECTION,
    rowId: "typeId",
    source: { kind: "api", useList: asQueryHook(useListCiTypesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Type"),
      textCol("description", "Description"),
      textCol("fields", "Fields"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create CI Type",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateCiTypeMutation),
    },
    stats: [
      { key: "total", label: "CI Types", compute: (rows) => rows.length, icon: <Boxes className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/asset-categories",
    title: "Asset Categories",
    description: "Categories used to classify assets with depreciation rules.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: { kind: "api", useList: asQueryHook(useListAssetCategoriesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Category"),
      textCol("parent.name", "Parent"),
      textCol("depreciation", "Depreciation"),
      textCol("isActive", "Active"),
      textCol("_count.children", "Children"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Asset Category",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateAssetCategoryMutation),
    },
    stats: [
      { key: "total", label: "Categories", compute: (rows) => rows.length, icon: <Package className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/lifecycle-rules",
    title: "Asset Lifecycle Rules",
    description: "Relationship types that encode asset lifecycle and inter-CI dependencies.",
    sectionLabel: SECTION,
    rowId: "relationshipTypeId",
    source: { kind: "api", useList: asQueryHook(useListRelationshipTypesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Relationship"),
      textCol("sourceTypeKey", "Source Type"),
      textCol("targetTypeKey", "Target Type"),
      textCol("isDirectional", "Directional"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Relationship Type",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "sourceTypeKey", label: "Source Type Key", type: "text" },
        { key: "targetTypeKey", label: "Target Type Key", type: "text" },
      ],
      useCreate: asMutationHook(useCreateRelationshipTypeMutation),
    },
    stats: [
      { key: "total", label: "Relationships", compute: (rows) => rows.length, icon: <RefreshCw className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: columns.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/columns.tsx`

import type { ReactNode } from "react";
import type { Column } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { StatusVariant } from "../components/ui/StatusBadge";
import type { ResourceRow } from "../components/resource/types";
import { getField, formatDate, displayValue } from "../components/resource/helpers";

export function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record.name ?? record.key ?? record.label ?? record.email;
    if (name !== undefined) return String(name);
    const keys = Object.keys(record);
    return keys.length === 0 ? "—" : `{${keys.length} props}`;
  }
  return String(value);
}

export interface TextColOptions {
  className?: string;
  sortable?: boolean;
  truncate?: number;
  headerClassName?: string;
}

export function textCol(key: string, header: string, opts: TextColOptions = {}): Column<ResourceRow> {
  const value = opts.truncate
    ? (row: ResourceRow) => {
        const text = displayValue(getField(row, key));
        return text.length > opts.truncate! ? `${text.slice(0, opts.truncate! - 1)}…` : text;
      }
    : (row: ResourceRow) => formatCell(getField(row, key));
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: value,
  };
}

export function dateCol(key: string, header: string, opts: TextColOptions = {}): Column<ResourceRow> {
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: (row) => <>{formatDate(getField(row, key))}</>,
  };
}

export function statusCol(
  key: string,
  header: string,
  variant?: (row: ResourceRow) => StatusVariant,
  opts: TextColOptions = {},
): Column<ResourceRow> {
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: (row) => {
      const raw = getField(row, key);
      const status = raw && typeof raw === "object" ? String((raw as { name?: unknown }).name ?? "") : String(raw ?? "");
      return <StatusBadge status={status || "—"} variant={variant ? variant(row) : "default"} />;
    },
  };
}

export type { ResourceRow };


---
## 7) Config-Driven Resource: emailNotifications.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/emailNotifications.tsx`

import { Settings, Mail, Bell, ClipboardList } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListEmailProvidersQuery,
  useCreateEmailProviderMutation,
  useListEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useListNotificationRulesQuery,
  useCreateNotificationRuleMutation,
  useListDeliveryLogsQuery,
} from "@services/saasadmin";

const SECTION = "Email & Notifications";

const PROVIDER_TYPES = [
  { value: "SMTP", label: "SMTP" },
  { value: "SES", label: "Amazon SES" },
  { value: "MAILGUN", label: "Mailgun" },
  { value: "SENDGRID", label: "SendGrid" },
];

const DELIVERY_STATUS = [
  { value: "SENT", label: "Sent" },
  { value: "QUEUED", label: "Queued" },
  { value: "FAILED", label: "Failed" },
  { value: "BOUNCED", label: "Bounced" },
  { value: "SUPPRESSED", label: "Suppressed" },
];

export const EMAIL_NOTIFICATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/email-notifications/server-settings",
    title: "Email Server Settings",
    description: "Email providers configured for platform outbound mail.",
    sectionLabel: SECTION,
    rowId: "providerId",
    source: { kind: "api", useList: asQueryHook(useListEmailProvidersQuery) },
    columns: [
      textCol("name", "Provider"),
      textCol("providerType", "Type"),
      textCol("fromEmail", "From"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.fromEmail} ${r.providerType}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "UNVERIFIED", label: "Unverified" },
          { value: "DISABLED", label: "Disabled" },
          { value: "ERROR", label: "Error" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Add Email Provider",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "providerType", label: "Provider Type", type: "select", options: PROVIDER_TYPES, required: true },
        { key: "fromEmail", label: "From Email", type: "text", required: true },
        { key: "fromName", label: "From Name", type: "text" },
        { key: "replyTo", label: "Reply To", type: "text" },
      ],
      useCreate: asMutationHook(useCreateEmailProviderMutation),
      successMessage: "Email provider added.",
    },
    stats: [
      { key: "total", label: "Providers", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => r.status === "ACTIVE").length, color: "success", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/templates",
    title: "Email Templates",
    description: "Reusable email templates keyed by event channel.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: { kind: "api", useList: asQueryHook(useListEmailTemplatesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Template"),
      textCol("channel", "Channel"),
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.subject}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DRAFT", label: "Draft" },
          { value: "DISABLED", label: "Disabled" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create Email Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "channel", label: "Channel", type: "text" },
        { key: "subject", label: "Subject", type: "text" },
      ],
      useCreate: asMutationHook(useCreateEmailTemplateMutation),
    },
    stats: [
      { key: "total", label: "Templates", compute: (rows) => rows.length, icon: <Mail className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <Mail className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/rules",
    title: "Notification Rules",
    description: "Event-driven rules that dispatch notification deliveries.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListNotificationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      { key: "eventKey", header: "Event", render: (r) => <span className="font-mono text-xs">{String(r.eventKey ?? "—")}</span> },
      textCol("channel", "Channel"),
      textCol("template.name", "Template"),
      textCol("priority", "Priority"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.eventKey}`,
    create: {
      title: "Create Notification Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "eventKey", label: "Event Key", type: "text" },
        { key: "channel", label: "Channel", type: "text" },
        { key: "priority", label: "Priority", type: "number" },
      ],
      useCreate: asMutationHook(useCreateNotificationRuleMutation),
    },
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <Bell className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Bell className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/inbound",
    title: "Inbound Email",
    description: "Providers servicing inbound email routing (from/reply-to addresses).",
    sectionLabel: SECTION,
    rowId: "providerId",
    source: { kind: "api", useList: asQueryHook(useListEmailProvidersQuery) },
    columns: [
      textCol("name", "Provider"),
      textCol("providerType", "Type"),
      textCol("fromEmail", "From"),
      textCol("replyTo", "Reply To"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    ],
    searchable: (r) => `${r.name} ${r.fromEmail} ${r.replyTo}`,
    stats: [
      { key: "total", label: "Providers", compute: (rows) => rows.length, icon: <Mail className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/delivery-logs",
    title: "Delivery Logs",
    description: "Delivery history for emails and notifications across the platform.",
    sectionLabel: SECTION,
    rowId: "deliveryId",
    source: { kind: "api", useList: asQueryHook(useListDeliveryLogsQuery) },
    columns: [
      { key: "id", header: "Delivery", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.deliveryId ?? "—").toString().slice(0, 8))}</span> },
      textCol("channel", "Channel"),
      textCol("recipient", "Recipient"),
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("sentAt", "Sent"),
    ],
    searchable: (r) => `${r.recipient} ${r.subject} ${r.channel}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: DELIVERY_STATUS, placeholder: "All statuses" },
    ],
    stats: [
      { key: "total", label: "Deliveries", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "sent", label: "Sent", compute: (rows) => rows.filter((r) => r.status === "SENT").length, color: "success", icon: <ClipboardList className="h-5 w-5" /> },
      { key: "failed", label: "Failed", compute: (rows) => rows.filter((r) => r.status === "FAILED" || r.status === "BOUNCED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: integrationsApi.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/integrationsApi.tsx`

import { Network, KeyRound, Globe, ClipboardList } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListIntegrationsQuery,
  useCreateIntegrationMutation,
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} from "@services/saasadmin";

const SECTION = "Integrations & API";

export const INTEGRATIONS_API_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/integrations-api/directory",
    title: "Integration Directory",
    description: "Third-party integrations available on the platform.",
    sectionLabel: SECTION,
    rowId: "integrationId",
    source: { kind: "api", useList: asQueryHook(useListIntegrationsQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? r.id ?? "—")}</span> },
      textCol("name", "Integration"),
      textCol("provider", "Provider"),
      textCol("category", "Category"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("configured", "Configured"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.provider} ${r.category}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "UNCONFIGURED", label: "Unconfigured" },
          { value: "ERROR", label: "Error" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Add Integration",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "provider", label: "Provider", type: "text" },
        { key: "category", label: "Category", type: "text" },
      ],
      useCreate: asMutationHook(useCreateIntegrationMutation),
    },
    stats: [
      { key: "total", label: "Integrations", compute: (rows) => rows.length, icon: <Network className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED" || r.isEnabled).length, color: "success", icon: <Network className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/api-keys",
    title: "API Keys",
    description: "Platform API keys with scoped access and rotation.",
    sectionLabel: SECTION,
    rowId: "keyId",
    source: { kind: "api", useList: asQueryHook(useListApiKeysQuery) },
    columns: [
      textCol("name", "Name"),
      { key: "keyPrefix", header: "Key Prefix", render: (r) => <span className="font-mono text-xs">{String(r.keyPrefix ?? "—")}</span> },
      textCol("scopes", "Scopes"),
      dateCol("lastUsedAt", "Last Used"),
      dateCol("expiresAt", "Expires"),
      textCol("revokedAt", "Revoked"),
    ],
    searchable: (r) => `${r.name} ${r.keyPrefix}`,
    create: {
      title: "Create API Key",
      description: "The secret is shown once after creation.",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "scopes", label: "Scopes", type: "text", help: "Comma-separated scopes" },
        { key: "tenantId", label: "Tenant (optional)", type: "text" },
      ],
      useCreate: asMutationHook(useCreateApiKeyMutation),
      successMessage: "API key created.",
    },
    stats: [
      { key: "total", label: "API Keys", compute: (rows) => rows.length, icon: <KeyRound className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => !r.revokedAt).length, color: "success", icon: <KeyRound className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/webhooks",
    title: "Webhooks",
    description: "Outbound webhook subscriptions with delivery retries.",
    sectionLabel: SECTION,
    rowId: "webhookId",
    source: { kind: "api", useList: asQueryHook(useListWebhooksQuery) },
    columns: [
      textCol("name", "Webhook"),
      textCol("url", "URL"),
      textCol("eventKeys", "Events"),
      textCol("failureCount", "Failures"),
      dateCol("lastDeliveryAt", "Last Delivery"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.url}`,
    create: {
      title: "Create Webhook",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "url", label: "URL", type: "text", required: true },
        { key: "eventKeys", label: "Event Keys", type: "text", help: "Comma-separated" },
      ],
      useCreate: asMutationHook(useCreateWebhookMutation),
      successMessage: "Webhook created.",
    },
    stats: [
      { key: "total", label: "Webhooks", compute: (rows) => rows.length, icon: <Globe className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Globe className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/oauth",
    title: "OAuth Applications",
    description: "API-key-backed applications that provision OAuth client access.",
    sectionLabel: SECTION,
    rowId: "keyId",
    source: { kind: "api", useList: asQueryHook(useListApiKeysQuery) },
    columns: [
      textCol("name", "Application"),
      { key: "keyPrefix", header: "Client Prefix", render: (r) => <span className="font-mono text-xs">{String(r.keyPrefix ?? "—")}</span> },
      textCol("scopes", "Scopes"),
      dateCol("lastUsedAt", "Last Used"),
    ],
    searchable: (r) => `${r.name} ${r.keyPrefix}`,
    stats: [
      { key: "total", label: "Applications", compute: (rows) => rows.length, icon: <Network className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/integrations-api/logs",
    title: "Integration Logs",
    description: "Integration connectivity, test results and recent activity.",
    sectionLabel: SECTION,
    rowId: "integrationId",
    source: { kind: "api", useList: asQueryHook(useListIntegrationsQuery) },
    columns: [
      textCol("name", "Integration"),
      textCol("provider", "Provider"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("lastTestedAt", "Last Tested"),
      textCol("lastTestResult", "Result"),
    ],
    searchable: (r) => `${r.name} ${r.provider}`,
    stats: [
      { key: "total", label: "Integrations", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "error", label: "Error", compute: (rows) => rows.filter((r) => r.status === "ERROR").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];

export const INTEGRATIONS_API_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/integrations-api/sso",
    title: "SSO Configuration",
    description: "Security settings that govern single sign-on and session policy.",
    sectionLabel: SECTION,
    fields: [
      { key: "passwordPolicy", label: "Password Policy", type: "textarea" },
      { key: "sessionTimeoutMinutes", label: "Session Timeout (min)", type: "number" },
      { key: "requireMfaForStaff", label: "Require MFA for Staff", type: "boolean" },
      { key: "ipAllowlist", label: "IP Allowlist", type: "textarea" },
    ],
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        passwordPolicy: JSON.stringify(value?.passwordPolicy ?? "", null, 2),
        sessionTimeoutMinutes: Number(value?.sessionTimeoutMinutes ?? 60),
        requireMfaForStaff: Boolean(value?.requireMfaForStaff),
        ipAllowlist: Array.isArray(value?.ipAllowlist) ? (value?.ipAllowlist as string[]).join(", ") : String(value?.ipAllowlist ?? ""),
      };
    },
    buildBody: (values) => ({
      passwordPolicy: String(values.passwordPolicy ?? ""),
      sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes ?? 60),
      requireMfaForStaff: Boolean(values.requireMfaForStaff),
      ipAllowlist: String(values.ipAllowlist ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    }),
    savedMessage: "SSO settings saved.",
  },
];


---
## 7) Config-Driven Resource: itsmConfiguration.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/itsmConfiguration.tsx`

import { Settings, FileText } from "lucide-react";
import { asQueryHook, asMutationHook } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig } from "../components/resource/types";
import { textCol } from "./columns";
import {
  useGetItsmModuleQuery,
  useUpdateItsmModuleMutation,
  useListItsmPrioritiesQuery,
  useCreateItsmPriorityMutation,
  useListItsmStatusesQuery,
  useCreateItsmStatusMutation,
} from "@services/saasadmin";

const SECTION = "Global ITSM Configuration";

function modulePanel(path: string, title: string, description: string, moduleKey: string, moduleName: string): ConfigPanelConfig {
  return {
    path,
    title,
    description: `${description} (module "${moduleName}").`,
    sectionLabel: SECTION,
    fields: [
      { key: "moduleKey", label: "Module", type: "text", readOnly: true },
      { key: "name", label: "Module Name", type: "text", readOnly: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "isEnabled", label: "Enabled for tenants", type: "boolean", help: "Globally enable or disable this ITSM module." },
      { key: "defaultSettings", label: "Default Settings", type: "textarea", help: "JSON default settings applied to new tenants." },
    ],
    useGet: asQueryHook(() => useGetItsmModuleQuery(moduleKey)),
    useUpdate: asMutationHook(useUpdateItsmModuleMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        moduleKey: value?.moduleKey ?? moduleKey,
        name: value?.name ?? moduleName,
        description: value?.description ?? "",
        isEnabled: Boolean(value?.isEnabled),
        defaultSettings: JSON.stringify(value?.defaultSettings ?? {}, null, 2),
      };
    },
    buildBody: (values) => ({
      description: String(values.description ?? ""),
      isEnabled: Boolean(values.isEnabled),
      defaultSettings: (() => {
        try {
          return JSON.parse(String(values.defaultSettings ?? "{}"));
        } catch {
          return {};
        }
      })(),
    }),
  };
}

export const ITSM_CONFIGURATION_PANELS: ConfigPanelConfig[] = [
  modulePanel(
    "/saas-admin/itsm-configuration/incidents",
    "Incident Configuration",
    "Global incident management settings and defaults.",
    "incident",
    "Incident Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/problems",
    "Problem Configuration",
    "Global problem management settings and defaults.",
    "problem",
    "Problem Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/changes",
    "Change Configuration",
    "Global change management settings and defaults.",
    "change",
    "Change Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/requests",
    "Request Configuration",
    "Global service request configuration and defaults.",
    "request",
    "Service Request",
  ),
];

export const ITSM_CONFIGURATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/itsm-configuration/priority-status",
    title: "Priority & Status Rules",
    description: "Global priority definitions applied across ITSM modules.",
    sectionLabel: SECTION,
    rowId: "priorityId",
    source: { kind: "api", useList: asQueryHook(useListItsmPrioritiesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Priority"),
      textCol("rank", "Rank"),
      textCol("color", "Color"),
      textCol("isDefault", "Default"),
      textCol("settings", "Settings"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Priority",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "rank", label: "Rank", type: "number" },
        { key: "color", label: "Color", type: "text" },
      ],
      useCreate: asMutationHook(useCreateItsmPriorityMutation),
    },
    stats: [
      { key: "total", label: "Priorities", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
      { key: "default", label: "Default", compute: (rows) => rows.filter((r) => r.isDefault).length, color: "success", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/itsm-configuration/custom-fields",
    title: "Custom Fields",
    description: "Global status definitions that power per-module record fields.",
    sectionLabel: SECTION,
    rowId: "statusId",
    source: { kind: "api", useList: asQueryHook(useListItsmStatusesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Status"),
      textCol("moduleKey", "Module"),
      textCol("category", "Category"),
      textCol("color", "Color"),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.moduleKey}`,
    create: {
      title: "Create Status",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "moduleKey", label: "Module", type: "text" },
        { key: "category", label: "Category", type: "text" },
        { key: "color", label: "Color", type: "text" },
      ],
      useCreate: asMutationHook(useCreateItsmStatusMutation),
    },
    stats: [
      { key: "total", label: "Statuses", compute: (rows) => rows.length, icon: <FileText className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: knowledgeManagement.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/knowledgeManagement.tsx`

import { Settings, Boxes, ShieldCheck, UserRound } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListKnowledgePoliciesQuery,
  useCreateKnowledgePolicyMutation,
  useListKnowledgeCategoriesQuery,
  useCreateKnowledgeCategoryMutation,
  useListKnowledgeReviewRulesQuery,
  useCreateKnowledgeReviewRuleMutation,
  useListKnowledgeTemplatesQuery,
  useCreateKnowledgeTemplateMutation,
} from "@services/saasadmin";

const SECTION = "Knowledge Management";

export const KNOWLEDGE_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/knowledge-management/settings",
    title: "Knowledge Base Settings",
    description: "Knowledge base policies for authoring, publishing and review.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListKnowledgePoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      textCol("description", "Description"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Knowledge Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateKnowledgePolicyMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/knowledge-management/categories",
    title: "Article Categories",
    description: "Hierarchy of knowledge article categories.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: { kind: "api", useList: asQueryHook(useListKnowledgeCategoriesQuery) },
    columns: [
      textCol("name", "Category"),
      textCol("description", "Description"),
      textCol("parent.name", "Parent"),
      textCol("sortOrder", "Sort Order"),
      textCol("isActive", "Active"),
      textCol("_count.templates", "Templates"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Category",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
      useCreate: asMutationHook(useCreateKnowledgeCategoryMutation),
    },
    stats: [
      { key: "total", label: "Categories", compute: (rows) => rows.length, icon: <Boxes className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/knowledge-management/publishing-rules",
    title: "Publishing Rules",
    description: "Review scheduling rules that govern content publishing.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListKnowledgeReviewRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      textCol("category.name", "Category"),
      textCol("intervalDays", "Review Interval (days)"),
      textCol("notifyBeforeDays", "Notify Before"),
      textCol("action", "Action"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name}`,
    create: {
      title: "Create Review Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "intervalDays", label: "Review Interval (days)", type: "number" },
        { key: "notifyBeforeDays", label: "Notify Before (days)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateKnowledgeReviewRuleMutation),
    },
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/knowledge-management/moderation",
    title: "Content Moderation",
    description: "Article template status and moderation state across the knowledge base.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: { kind: "api", useList: asQueryHook(useListKnowledgeTemplatesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Title"),
      textCol("category.name", "Category"),
      statusCol("status", "State", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("fields", "Fields"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Article Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateKnowledgeTemplateMutation),
    },
    stats: [
      { key: "total", label: "Templates", compute: (rows) => rows.length, icon: <UserRound className="h-5 w-5" /> },
      { key: "enabled", label: "Published", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <UserRound className="h-5 w-5" /> },
      { key: "draft", label: "Draft", compute: (rows) => rows.filter((r) => r.status === "DRAFT").length, color: "warning", icon: <UserRound className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: myAccount.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/myAccount.tsx`

import { ShieldCheck, Activity } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig, ResourceRow } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useGetMySecurityQuery,
  useListMySessionsQuery,
  useRevokeMySessionMutation,
} from "@services/saasadmin";

const SECTION = "My Account";

export const MY_ACCOUNT_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/my-account/profile",
    title: "My Profile",
    description: "Your personal preferences and portal defaults.",
    sectionLabel: SECTION,
    fields: [
      { key: "timezone", label: "Timezone", type: "text" },
      { key: "locale", label: "Locale", type: "text" },
      { key: "theme", label: "Theme", type: "select", options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }] },
      { key: "density", label: "UI Density", type: "select", options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }] },
      { key: "landingPage", label: "Landing Page", type: "text" },
      { key: "emailNotifications", label: "Email Notifications", type: "textarea", help: "JSON preferences for which emails you receive." },
    ],
    useGet: asQueryHook(useGetMyPreferencesQuery),
    useUpdate: asMutationHook(useUpdateMyPreferencesMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        timezone: String(value?.timezone ?? ""),
        locale: String(value?.locale ?? ""),
        theme: String(value?.theme ?? "system"),
        density: String(value?.density ?? "comfortable"),
        landingPage: String(value?.landingPage ?? ""),
        emailNotifications: JSON.stringify(value?.emailNotifications ?? {}, null, 2),
      };
    },
    buildBody: (values) => ({
      timezone: String(values.timezone ?? ""),
      locale: String(values.locale ?? ""),
      theme: String(values.theme ?? "system"),
      density: String(values.density ?? "comfortable"),
      landingPage: String(values.landingPage ?? ""),
      emailNotifications: (() => {
        try {
          return JSON.parse(String(values.emailNotifications ?? "{}"));
        } catch {
          return {};
        }
      })(),
    }),
  },
];

export const MY_ACCOUNT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/my-account/mfa-security",
    title: "MFA & Security",
    description: "Recent security events on your account.",
    sectionLabel: SECTION,
    rowId: "id",
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      extractRows: (payload) => {
        const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
        const events = Array.isArray(value?.recentSecurityEvents) ? (value?.recentSecurityEvents as ResourceRow[]) : [];
        return events.map((e, i) => ({ id: String((e.id ?? i).toString()), ...e }));
      },
    },
    columns: [
      textCol("eventType", "Event"),
      statusCol("severity", "Severity", (r) => VARIANT_FROM_STATUS(String(r.severity))),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) => `${r.eventType} ${r.details} ${r.ipAddress}`,
    stats: [
      { key: "total", label: "Events", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/my-account/sessions",
    title: "Active Sessions",
    description: "Devices and sessions currently signed in as you.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListMySessionsQuery) },
    quickAction: {
      label: "Revoke",
      icon: <Activity className="h-3.5 w-3.5" />,
      useAction: asMutationHook(useRevokeMySessionMutation),
      buildArg: (row) => row.sessionId ?? row.id,
      successMessage: () => "Session revoked.",
    },
    columns: [
      textCol("userAgent", "Device"),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "Signed In"),
      dateCol("lastUsedAt", "Last Used"),
      dateCol("expiresAt", "Expires"),
      textCol("isCurrent", "Current"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.userAgent} ${r.ipAddress}`,
    stats: [
      { key: "total", label: "Sessions", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => r.isActive !== false && !r.revokedAt).length, color: "success", icon: <Activity className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: platformSettings.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/platformSettings.tsx`

import { Settings, Globe } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig, ResourceRow } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListPlatformSettingsQuery,
  useGetBrandingSettingsQuery,
  useUpdateBrandingSettingsMutation,
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
  useGetMaintenanceQuery,
  useUpdateMaintenanceMutation,
  useListAllTenantDomainsQuery,
  useCreateTenantDomainMutation,
} from "@services/saasadmin";

const SECTION = "Platform Settings";

export const PLATFORM_SETTINGS_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/platform-settings/general",
    title: "General Settings",
    description: "Platform setting keys grouped by domain.",
    sectionLabel: SECTION,
    rowId: "key",
    source: { kind: "api", useList: asQueryHook(useListPlatformSettingsQuery), extractRows: (payload) => extractArray(payload) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("group", "Group"),
      textCol("type", "Type"),
      textCol("description", "Description"),
      textCol("value", "Value", { truncate: 40 }),
    ],
    searchable: (r) => `${r.key} ${r.group} ${r.description}`,
    stats: [
      { key: "total", label: "Settings", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/platform-settings/domains",
    title: "Custom Domains",
    description: "Custom domains provisioned for tenants.",
    sectionLabel: SECTION,
    rowId: "domain",
    source: { kind: "api", useList: asQueryHook(useListAllTenantDomainsQuery) },
    columns: [
      { key: "domain", header: "Domain", render: (r) => <span className="text-sm font-medium text-slate-800">{String(r.domain ?? "—")}</span> },
      { key: "tenant.name", header: "Tenant", render: (r) => <span className="text-sm text-slate-700">{String((r.tenant as { name?: string } | undefined)?.name ?? "—")}</span> },
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("type", "Type"),
      dateCol("verifiedAt", "Verified"),
      dateCol("activatedAt", "Activated"),
    ],
    searchable: (r) => `${r.domain} ${(r.tenant as { name?: string } | undefined)?.name ?? ""}`,
    create: {
      title: "Add Custom Domain",
      fields: [
        { key: "domain", label: "Domain", type: "text", required: true, placeholder: "portal.example.com", help: "Fully-qualified domain name to register." },
        { key: "tenantId", label: "Tenant", type: "select", optionsSource: "tenants", required: true, help: "Domain is registered for the selected tenant." },
      ],
      useCreate: asMutationHook(useCreateTenantDomainMutation),
      buildBody: (values) => ({ tenantId: String(values.tenantId ?? ""), body: { domain: String(values.domain ?? "") } }),
    },
    stats: [
      { key: "total", label: "Domains", compute: (rows) => rows.length, icon: <Globe className="h-5 w-5" /> },
    ],
  },
];

function extractArray(payload: unknown): ResourceRow[] {
  if (Array.isArray(payload)) return payload as ResourceRow[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: ResourceRow[] }).data;
  }
  return [];
}

export const PLATFORM_SETTINGS_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/platform-settings/branding",
    title: "Branding & White Label",
    description: "Platform name, logo and color branding.",
    sectionLabel: SECTION,
    fields: [
      { key: "platformName", label: "Platform Name", type: "text" },
      { key: "logoUrl", label: "Logo URL", type: "text" },
      { key: "faviconUrl", label: "Favicon URL", type: "text" },
      { key: "primaryColor", label: "Primary Color", type: "text" },
    ],
    useGet: asQueryHook(useGetBrandingSettingsQuery),
    useUpdate: asMutationHook(useUpdateBrandingSettingsMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        platformName: String(value?.platformName ?? ""),
        logoUrl: String(value?.logoUrl ?? ""),
        faviconUrl: String(value?.faviconUrl ?? ""),
        primaryColor: String(value?.primaryColor ?? ""),
      };
    },
    buildBody: (values) => ({
      platformName: String(values.platformName ?? ""),
      logoUrl: String(values.logoUrl ?? ""),
      faviconUrl: String(values.faviconUrl ?? ""),
      primaryColor: String(values.primaryColor ?? ""),
    }),
  },
  {
    path: "/saas-admin/platform-settings/localization",
    title: "Localization & Time Zones",
    description: "Default locale, timezone and date formatting.",
    sectionLabel: SECTION,
    fields: [
      { key: "defaultTimezone", label: "Default Timezone", type: "text" },
      { key: "defaultLocale", label: "Default Locale", type: "text" },
      { key: "dateFormat", label: "Date Format", type: "text" },
    ],
    useGet: asQueryHook(useGetLocalizationSettingsQuery),
    useUpdate: asMutationHook(useUpdateLocalizationSettingsMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        defaultTimezone: String(value?.defaultTimezone ?? ""),
        defaultLocale: String(value?.defaultLocale ?? ""),
        dateFormat: String(value?.dateFormat ?? ""),
      };
    },
    buildBody: (values) => ({
      defaultTimezone: String(values.defaultTimezone ?? ""),
      defaultLocale: String(values.defaultLocale ?? ""),
      dateFormat: String(values.dateFormat ?? ""),
    }),
  },
  {
    path: "/saas-admin/platform-settings/maintenance",
    title: "Maintenance Mode",
    description: "Enable maintenance mode and gate access by IP allowlist.",
    sectionLabel: SECTION,
    fields: [
      { key: "enabled", label: "Maintenance Mode Enabled", type: "boolean" },
      { key: "message", label: "Maintenance Message", type: "textarea" },
      { key: "allowedIps", label: "Allowed IPs", type: "textarea", help: "Comma-separated IP addresses that bypass maintenance mode." },
    ],
    useGet: asQueryHook(useGetMaintenanceQuery),
    useUpdate: asMutationHook(useUpdateMaintenanceMutation),
    getValues: (payload) => {
      const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
      return {
        enabled: Boolean(value?.enabled),
        message: String(value?.message ?? ""),
        allowedIps: Array.isArray(value?.allowedIps) ? (value?.allowedIps as string[]).join(", ") : String(value?.allowedIps ?? ""),
      };
    },
    buildBody: (values) => ({
      enabled: Boolean(values.enabled),
      message: String(values.message ?? ""),
      allowedIps: String(values.allowedIps ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    }),
    savedMessage: "Maintenance mode updated.",
    stats: (value) => {
      const v = (value as Record<string, unknown> | undefined) ?? {};
      return [{ label: "Maintenance Mode", value: Boolean(v.enabled) ? "Enabled" : "Disabled", color: Boolean(v.enabled) ? ("danger" as const) : ("success" as const) }];
    },
  },
];


---
## 7) Config-Driven Resource: reportsAnalytics.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/reportsAnalytics.tsx`

import { BarChart3, Users, CreditCard, DollarSign, Activity, ClipboardList } from "lucide-react";
import { asQueryHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import { useReportCatalogQuery, useListReportRunsQuery } from "@services/saasadmin";

const SECTION = "Reports & Analytics";

const RUN_STATUS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "QUEUED", label: "Queued" },
  { value: "RUNNING", label: "Running" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const REPORTS_ANALYTICS_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/reports-analytics/platform-overview",
    title: "Platform Overview",
    description: "Catalog of reports and analytics available on the platform.",
    sectionLabel: SECTION,
    rowId: "key",
    source: { kind: "api", useList: asQueryHook(useReportCatalogQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Report"),
      textCol("description", "Description"),
      textCol("category", "Category"),
      textCol("formats", "Formats"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.description}`,
    stats: [
      { key: "total", label: "Reports", compute: (rows) => rows.length, icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/tenant-usage",
    title: "Tenant Usage Reports",
    description: "Generated tenant usage analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      textCol("requestedBy.email", "Requested By"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: RUN_STATUS, placeholder: "All statuses" }],
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <Users className="h-5 w-5" /> },
      { key: "completed", label: "Completed", compute: (rows) => rows.filter((r) => r.status === "COMPLETED").length, color: "success", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/subscriptions",
    title: "Subscription Reports",
    description: "Generated subscription analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <CreditCard className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/revenue",
    title: "Revenue Reports",
    description: "Generated revenue analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <DollarSign className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/staff-activity",
    title: "Staff Activity Reports",
    description: "Generated staff activity analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/reports-analytics/audit",
    title: "Audit Reports",
    description: "Generated audit analytics report jobs.",
    sectionLabel: SECTION,
    rowId: "runId",
    source: { kind: "api", useList: asQueryHook(useListReportRunsQuery) },
    columns: [
      { key: "reportKey", header: "Report", render: (r) => <span className="font-mono text-xs">{String(r.reportKey ?? "—")}</span> },
      textCol("format", "Format"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("rowCount", "Rows"),
      dateCol("createdAt", "Created"),
    ],
    searchable: (r) => `${r.reportKey}`,
    stats: [
      { key: "total", label: "Runs", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: securityAudit.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/securityAudit.tsx`

import { ShieldCheck, ClipboardList, AlertTriangle, Database } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ConfigPanelConfig, ResourceRow } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListAccessPoliciesQuery,
  useCreateAccessPolicyMutation,
  useListAuditEventsQuery,
  useAuditSecurityEventsQuery,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetRetentionSettingsQuery,
} from "@services/saasadmin";

const SECTION = "Security & Audit";

const SECURITY_FIELDS_DEF = [
  { key: "passwordPolicy", label: "Password Policy", type: "textarea" as const },
  { key: "sessionTimeoutMinutes", label: "Session Timeout (min)", type: "number" as const },
  { key: "requireMfaForStaff", label: "Require MFA for Staff", type: "boolean" as const },
  { key: "ipAllowlist", label: "IP Allowlist", type: "textarea" as const },
];

const securityGetValues = (payload: unknown) => {
  const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
  return {
    passwordPolicy: typeof value?.passwordPolicy === "string" ? String(value.passwordPolicy) : JSON.stringify(value?.passwordPolicy ?? "", null, 2),
    sessionTimeoutMinutes: Number(value?.sessionTimeoutMinutes ?? 60),
    requireMfaForStaff: Boolean(value?.requireMfaForStaff),
    ipAllowlist: Array.isArray(value?.ipAllowlist) ? (value?.ipAllowlist as string[]).join(", ") : String(value?.ipAllowlist ?? ""),
  };
};

const securityBuildBody = (values: Record<string, unknown>) => ({
  passwordPolicy: String(values.passwordPolicy ?? ""),
  sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes ?? 60),
  requireMfaForStaff: Boolean(values.requireMfaForStaff),
  ipAllowlist: String(values.ipAllowlist ?? "").split(",").map((s) => s.trim()).filter(Boolean),
});

export const SECURITY_AUDIT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/security-audit/policies",
    title: "Security Policies",
    description: "Access policies governing platform resource access.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListAccessPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      textCol("description", "Description"),
      textCol("policyType", "Type"),
      textCol("priority", "Priority"),
      textCol("rules", "Rules"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description} ${r.policyType}`,
    filters: [
      { key: "isEnabled", label: "Enabled only", type: "boolean" },
    ],
    create: {
      title: "Create Security Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "policyType", label: "Policy Type", type: "text" },
        { key: "priority", label: "Priority", type: "number" },
      ],
      useCreate: asMutationHook(useCreateAccessPolicyMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/security-audit/audit-logs",
    title: "Audit Logs",
    description: "Platform audit trail of actions across all resources.",
    sectionLabel: SECTION,
    rowId: "eventId",
    source: { kind: "api", useList: asQueryHook(useListAuditEventsQuery) },
    columns: [
      { key: "id", header: "Event", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.eventId ?? "—").toString().slice(0, 8))}</span> },
      { key: "action", header: "Action", render: (r) => <span className="font-mono text-xs">{String(r.action ?? "—")}</span> },
      textCol("resourceType", "Resource"),
      textCol("resourceId", "Resource ID"),
      textCol("actorEmail", "Actor"),
      statusCol("outcome", "Outcome", (r) => VARIANT_FROM_STATUS(String(r.outcome))),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) => `${r.action} ${r.resourceType} ${r.actorEmail} ${r.ipAddress}`,
    filters: [
      {
        key: "outcome",
        label: "Outcome",
        type: "select",
        options: [
          { value: "SUCCESS", label: "Success" },
          { value: "FAILURE", label: "Failure" },
          { value: "DENIED", label: "Denied" },
        ],
        placeholder: "All outcomes",
      },
    ],
    stats: [
      { key: "total", label: "Events", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "denied", label: "Denied", compute: (rows) => rows.filter((r) => r.outcome === "DENIED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/security-audit/suspicious-activity",
    title: "Suspicious Activity",
    description: "Security events flagged for review.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useAuditSecurityEventsQuery) },
    columns: [
      { key: "id", header: "Event", render: (r) => <span className="font-mono text-xs">{String((r.id ?? "—").toString().slice(0, 8))}</span> },
      textCol("eventType", "Type"),
      statusCol("severity", "Severity", (r) => VARIANT_FROM_STATUS(String(r.severity))),
      textCol("details", "Details"),
      textCol("ipAddress", "IP"),
      dateCol("createdAt", "When"),
    ],
    searchable: (r) => `${r.eventType} ${r.details} ${r.ipAddress}`,
    filters: [
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: [
          { value: "INFO", label: "Info" },
          { value: "LOW", label: "Low" },
          { value: "MEDIUM", label: "Medium" },
          { value: "HIGH", label: "High" },
          { value: "CRITICAL", label: "Critical" },
        ],
        placeholder: "All severities",
      },
    ],
    stats: [
      { key: "total", label: "Events", compute: (rows) => rows.length, icon: <AlertTriangle className="h-5 w-5" /> },
      { key: "high", label: "High / Critical", compute: (rows) => rows.filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL").length, color: "danger", icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
];

export function extractRetentionRows(payload: unknown): ResourceRow[] {
  const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
  const settings = value?.settings as Record<string, unknown> | undefined;
  const policies = settings?.policies ?? (value?.policies as unknown) ?? [];
  return Array.isArray(policies) ? (policies as ResourceRow[]) : [];
}

export const SECURITY_AUDIT_EXTRA_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/security-audit/data-retention",
    title: "Data Retention",
    description: "Retention policies controlling how long platform data is kept.",
    sectionLabel: SECTION,
    rowId: "resourceKey",
    source: {
      kind: "api",
      useList: asQueryHook(useGetRetentionSettingsQuery),
      extractRows: extractRetentionRows,
    },
    columns: [
      { key: "resourceKey", header: "Resource", render: (r) => <span className="font-mono text-xs">{String(r.resourceKey ?? "—")}</span> },
      textCol("retentionDays", "Retention (days)"),
      statusCol("action", "Action", (r) => VARIANT_FROM_STATUS(String(r.action))),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.resourceKey}`,
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <Database className="h-5 w-5" /> },
    ],
  },
];

export const SECURITY_AUDIT_PANELS: ConfigPanelConfig[] = [
  {
    path: "/saas-admin/security-audit/login-session",
    title: "Login & Session Policies",
    description: "Login, session timeout and password policy for the platform.",
    sectionLabel: SECTION,
    fields: SECURITY_FIELDS_DEF,
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: securityGetValues,
    buildBody: securityBuildBody,
  },
  {
    path: "/saas-admin/security-audit/mfa",
    title: "MFA Configuration",
    description: "Multi-factor authentication enforcement for platform access.",
    sectionLabel: SECTION,
    fields: [
      { key: "requireMfaForStaff", label: "Require MFA for Staff", type: "boolean", help: "Staff must enroll a second factor before accessing the platform." },
      { key: "sessionTimeoutMinutes", label: "Session Timeout (min)", type: "number" },
      { key: "passwordPolicy", label: "Password Policy", type: "textarea" },
    ],
    useGet: asQueryHook(useGetSecuritySettingsQuery),
    useUpdate: asMutationHook(useUpdateSecuritySettingsMutation),
    getValues: securityGetValues,
    buildBody: securityBuildBody,
    savedMessage: "MFA settings saved.",
  },
];


---
## 7) Config-Driven Resource: serviceManagement.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/serviceManagement.tsx`

import { Layers, Boxes, FileText, Globe } from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListServicesQuery,
  useCreateServiceMutation,
  useListServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useListServiceTemplatesQuery,
  useCreateServiceTemplateMutation,
  useListSlaCalendarsQuery,
} from "@services/saasadmin";

const SECTION = "Service Management";

export const SERVICE_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/service-management/catalog",
    title: "Service Catalog",
    description: "Global service catalog offered across tenants.",
    sectionLabel: SECTION,
    rowId: "serviceId",
    source: { kind: "api", useList: asQueryHook(useListServicesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("category.name", "Category"),
      textCol("owner", "Owner"),
      textCol("_count.templates", "Templates"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.owner}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "DRAFT", label: "Draft" },
        ],
        placeholder: "All statuses",
      },
    ],
    stats: [
      { key: "total", label: "Total Services", compute: (rows) => rows.length, icon: <Layers className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <Layers className="h-5 w-5" /> },
      { key: "draft", label: "Draft", compute: (rows) => rows.filter((r) => r.status === "DRAFT").length, color: "warning", icon: <Layers className="h-5 w-5" /> },
    ],
    create: {
      title: "Create Service",
      description: "Add a new catalog service.",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "owner", label: "Owner", type: "text" },
      ],
      useCreate: asMutationHook(useCreateServiceMutation),
    },
  },
  {
    path: "/saas-admin/service-management/categories",
    title: "Service Categories",
    description: "Manage the global service category hierarchy.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: { kind: "api", useList: asQueryHook(useListServiceCategoriesQuery) },
    columns: [
      textCol("name", "Name"),
      textCol("description", "Description"),
      textCol("parent.name", "Parent Category"),
      textCol("sortOrder", "Sort Order"),
      textCol("_count.children", "Child Categories"),
      textCol("_count.services", "Services"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Category",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
      useCreate: asMutationHook(useCreateServiceCategoryMutation),
    },
    stats: [
      { key: "total", label: "Categories", compute: (rows) => rows.length, icon: <Boxes className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/service-management/templates",
    title: "Service Templates",
    description: "Reusable service templates with versioned definitions.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: { kind: "api", useList: asQueryHook(useListServiceTemplatesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("service.name", "Service"),
      textCol("currentVersion", "Version"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "PUBLISHED", label: "Published" },
          { value: "DRAFT", label: "Draft" },
          { value: "RETIRED", label: "Retired" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateServiceTemplateMutation),
    },
    stats: [
      { key: "total", label: "Templates", compute: (rows) => rows.length, icon: <FileText className="h-5 w-5" /> },
      { key: "published", label: "Published", compute: (rows) => rows.filter((r) => r.status === "PUBLISHED").length, color: "success", icon: <FileText className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/service-management/availability",
    title: "Service Availability",
    description: "Working hours, calendars and holidays that define service availability.",
    sectionLabel: SECTION,
    rowId: "calendarId",
    source: { kind: "api", useList: asQueryHook(useListSlaCalendarsQuery) },
    columns: [
      textCol("name", "Calendar"),
      textCol("timezone", "Timezone"),
      textCol("workingHours", "Working Hours"),
      textCol("holidays", "Holidays"),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.timezone}`,
    stats: [
      { key: "total", label: "Calendars", compute: (rows) => rows.length, icon: <Globe className="h-5 w-5" /> },
      { key: "default", label: "Default", compute: (rows) => rows.filter((r) => r.isDefault).length, color: "success", icon: <Globe className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: slaManagement.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/slaManagement.tsx`

import { ShieldCheck, Target, AlertTriangle, Activity } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListSlaPoliciesQuery,
  useCreateSlaPolicyMutation,
  useListEscalationRulesQuery,
  useCreateEscalationRuleMutation,
} from "@services/saasadmin";

const SECTION = "SLA Management";

export const SLA_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/sla-management/policies",
    title: "SLA Policies",
    description: "Platform-wide SLA policies applied to tenant assignments.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListSlaPoliciesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("serviceLevels", "Service Levels"),
      textCol("_count.escalationRules", "Escalation Rules"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "DRAFT", label: "Draft" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create SLA Policy",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateSlaPolicyMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/targets",
    title: "SLA Targets",
    description: "SLA service levels define response and resolution targets.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListSlaPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("serviceLevels", "Targets"),
      textCol("settings", "Settings"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <Target className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/escalation-rules",
    title: "Escalation Rules",
    description: "Rules that escalate work items when SLA thresholds are breached.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("trigger", "Trigger"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("actions", "Actions"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    create: {
      title: "Create Escalation Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "trigger", label: "Trigger", type: "text" },
        { key: "thresholdMinutes", label: "Threshold (minutes)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateEscalationRuleMutation),
    },
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <AlertTriangle className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/sla-management/breaches",
    title: "SLA Breach Monitoring",
    description: "Escalation rules drive detection and handling of SLA breaches.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("actions", "On breach"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <Activity className="h-5 w-5" /> },
      { key: "enabled", label: "Active", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Activity className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: supportManagement.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/supportManagement.tsx`

import { LifeBuoy, Settings, AlertTriangle } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useListSupportQueuesQuery,
  useCreateSupportQueueMutation,
} from "@services/saasadmin";
import { useListEscalationRulesQuery, useCreateEscalationRuleMutation } from "@services/saasadmin";

const SECTION = "Support Management";

const TICKET_STATUS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
  { value: "REOPENED", label: "Reopened" },
];

export const SUPPORT_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/support-management/tickets",
    title: "Support Tickets",
    description: "Platform-level support tickets raised across tenants.",
    sectionLabel: SECTION,
    rowId: "ticketId",
    source: { kind: "api", useList: asQueryHook(useListSupportTicketsQuery) },
    columns: [
      { key: "ticketNumber", header: "Ticket", render: (r) => <span className="font-mono text-xs">{String(r.ticketNumber ?? "—")}</span> },
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("priority", "Priority"),
      textCol("requesterName", "Requester"),
      textCol("queue.name", "Queue"),
      textCol("_count.replies", "Replies"),
    ],
    searchable: (r) => `${r.subject} ${r.ticketNumber} ${r.requesterName}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: TICKET_STATUS, placeholder: "All statuses" },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "LOW", label: "Low" },
          { value: "NORMAL", label: "Normal" },
          { value: "HIGH", label: "High" },
          { value: "URGENT", label: "Urgent" },
        ],
        placeholder: "All priorities",
      },
    ],
    create: {
      title: "Create Support Ticket",
      fields: [
        { key: "subject", label: "Subject", type: "text", required: true },
        { key: "requesterName", label: "Requester Name", type: "text" },
        { key: "requesterEmail", label: "Requester Email", type: "text" },
        { key: "priority", label: "Priority", type: "select", options: [{ value: "LOW", label: "Low" }, { value: "NORMAL", label: "Normal" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }] },
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
    },
    stats: [
      { key: "total", label: "Tickets", compute: (rows) => rows.length, icon: <LifeBuoy className="h-5 w-5" /> },
      { key: "open", label: "Open", compute: (rows) => rows.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS" || r.status === "REOPENED").length, color: "info", icon: <LifeBuoy className="h-5 w-5" /> },
      { key: "resolved", label: "Resolved", compute: (rows) => rows.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length, color: "success", icon: <LifeBuoy className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/support-management/settings",
    title: "Customer Support Settings",
    description: "Support queues that route and triage incoming tickets.",
    sectionLabel: SECTION,
    rowId: "queueId",
    source: { kind: "api", useList: asQueryHook(useListSupportQueuesQuery) },
    columns: [
      textCol("name", "Queue"),
      textCol("email", "Email"),
      textCol("description", "Description"),
      textCol("isDefault", "Default"),
      textCol("ticketCounts.open", "Open"),
      textCol("ticketCounts.total", "Total"),
    ],
    searchable: (r) => `${r.name} ${r.email}`,
    create: {
      title: "Create Support Queue",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateSupportQueueMutation),
    },
    stats: [
      { key: "total", label: "Queues", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/support-management/escalation-policies",
    title: "Escalation Policies",
    description: "Rules that escalate support work when thresholds are exceeded.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Policy"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("trigger", "Trigger"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    create: {
      title: "Create Escalation Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "trigger", label: "Trigger", type: "text" },
        { key: "thresholdMinutes", label: "Threshold (minutes)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateEscalationRuleMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <AlertTriangle className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: systemAdministration.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/systemAdministration.tsx`

import { Activity, Cpu, ClipboardList, Database } from "lucide-react";
import { asQueryHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig, ResourceRow } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useSystemHealthQuery,
  useListSystemJobsQuery,
  useListSystemQueuesQuery,
  useSystemDiagnosticsQuery,
} from "@services/saasadmin";

const SECTION = "System Administration";

function objectToRows(payload: unknown, mapping: (rec: Record<string, unknown>) => ResourceRow[]): ResourceRow[] {
  const value = (payload && typeof payload === "object" && (payload as { data?: unknown }).data) as Record<string, unknown> | undefined;
  if (!value || typeof value !== "object") return [];
  return mapping(value);
}

const healthRows = (rec: Record<string, unknown>): ResourceRow[] => {
  const components = ["database", "redis", "storage", "queues", "scheduler"];
  const base: ResourceRow[] = [{ component: "Platform", status: rec.status ?? "n/a", detail: `${String(rec.environment ?? "")} ${String(rec.version ?? "")}`.trim(), latencyMs: "—" }];
  for (const c of components) {
    const info = (rec[c] ?? {}) as Record<string, unknown>;
    base.push({ component: c, status: info.status ?? "n/a", detail: info.detail ?? "", latencyMs: info.latencyMs ?? "—" });
  }
  return base;
};

const diagnosticsRows = (rec: Record<string, unknown>): ResourceRow[] => {
  const checks = Array.isArray(rec.checks) ? (rec.checks as Record<string, unknown>[]) : [];
  const base = checks.map((c, i) => ({
    component: String(c.name ?? `Check ${i + 1}`),
    status: c.status ?? "n/a",
    detail: c.detail ?? "",
  }));
  base.push({ component: "Memory", status: (rec.memory as Record<string, unknown>)?.status ?? "n/a", detail: String((rec.memory as Record<string, unknown>)?.detail ?? "") });
  base.push({ component: "Storage", status: (rec.storage as Record<string, unknown>)?.status ?? "n/a", detail: String((rec.storage as Record<string, unknown>)?.detail ?? "") });
  return base;
};

const queueRows = (rec: Record<string, unknown>): ResourceRow[] =>
  Object.entries(rec).map(([queue, info]) => {
    const detail = info && typeof info === "object" ? JSON.stringify(info) : String(info ?? "");
    return { queue, status: "ok", detail };
  });

const JOB_STATUS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "QUEUED", label: "Queued" },
  { value: "RUNNING", label: "Running" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const SYSTEM_ADMINISTRATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/system-administration/health",
    title: "System Health",
    description: "Live health of platform services, storage and schedulers.",
    sectionLabel: SECTION,
    rowId: "component",
    source: { kind: "api", useList: asQueryHook(useSystemHealthQuery), extractRows: (payload) => objectToRows(payload, healthRows) },
    columns: [
      textCol("component", "Component"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("detail", "Detail"),
      textCol("latencyMs", "Latency (ms)"),
    ],
    searchable: (r) => `${r.component} ${r.detail}`,
    stats: [
      { key: "healthy", label: "Healthy Components", compute: (rows) => rows.filter((r) => r.status === "ok" || r.status === "healthy").length, color: "success", icon: <Activity className="h-5 w-5" /> },
      { key: "degraded", label: "Degraded", compute: (rows) => rows.filter((r) => r.status === "degraded").length, color: "warning", icon: <Activity className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/system-administration/background-jobs",
    title: "Background Jobs",
    description: "Queued and running background jobs across the platform.",
    sectionLabel: SECTION,
    rowId: "jobId",
    source: { kind: "api", useList: asQueryHook(useListSystemJobsQuery) },
    columns: [
      { key: "id", header: "Job", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.jobId ?? "—").toString().slice(0, 8))}</span> },
      { key: "type", header: "Type", render: (r) => <span className="font-mono text-xs">{String(r.type ?? "—")}</span> },
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("attempts", "Attempts"),
      textCol("error", "Last Error"),
      dateCol("scheduledFor", "Scheduled"),
      dateCol("startedAt", "Started"),
    ],
    searchable: (r) => `${r.type} ${r.status} ${r.error}`,
    filters: [{ key: "status", label: "Status", type: "select", options: JOB_STATUS, placeholder: "All statuses" }],
    stats: [
      { key: "total", label: "Jobs", compute: (rows) => rows.length, icon: <Cpu className="h-5 w-5" /> },
      { key: "running", label: "Running", compute: (rows) => rows.filter((r) => r.status === "RUNNING").length, color: "info", icon: <Cpu className="h-5 w-5" /> },
      { key: "failed", label: "Failed", compute: (rows) => rows.filter((r) => r.status === "FAILED").length, color: "danger", icon: <Cpu className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/system-administration/queues",
    title: "Queue Monitoring",
    description: "Backlog and depth of platform worker queues.",
    sectionLabel: SECTION,
    rowId: "queue",
    source: { kind: "api", useList: asQueryHook(useListSystemQueuesQuery), extractRows: (payload) => objectToRows(payload, queueRows) },
    columns: [
      textCol("queue", "Queue"),
      textCol("detail", "Contents"),
    ],
    searchable: (r) => `${r.queue} ${r.detail}`,
    stats: [
      { key: "total", label: "Queues", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/system-administration/database",
    title: "Database Status",
    description: "Database journey and storage diagnostics.",
    sectionLabel: SECTION,
    rowId: "component",
    source: { kind: "api", useList: asQueryHook(useSystemDiagnosticsQuery), extractRows: (payload) => objectToRows(payload, diagnosticsRows) },
    columns: [
      textCol("component", "Check"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("detail", "Detail"),
    ],
    searchable: (r) => `${r.component} ${r.detail}`,
    stats: [
      { key: "ok", label: "Checks Passing", compute: (rows) => rows.filter((r) => r.status === "ok" || r.status === "healthy" || r.status === "passed" || r.status === true).length, color: "success", icon: <Database className="h-5 w-5" /> },
    ],
  },
];


---
## 7) Config-Driven Resource: workflowManagement.tsx

**Path:** `/Users/lalitpatidar/Downloads/osTicket/frontend/src/screens/saas-admin/resources/workflowManagement.tsx`

import { Workflow, CalendarDays, ClipboardList } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import { getField } from "../components/resource/helpers";
import {
  useListWorkflowTemplatesQuery,
  useCreateWorkflowTemplateMutation,
  useListWorkflowRunsQuery,
} from "@services/saasadmin";

const SECTION = "Workflow Management";

const templateColumns = (title: string, description: string): ResourceListConfig => ({
  path: "",
  title,
  description,
  sectionLabel: SECTION,
  rowId: "templateId",
  source: { kind: "api", useList: asQueryHook(useListWorkflowTemplatesQuery) },
  columns: [
    { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
    textCol("name", "Name"),
    statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    textCol("currentVersion", "Version"),
    textCol("_count.runs", "Runs"),
  ],
  searchable: (r) => `${r.name} ${r.key}`,
  filters: [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
        { value: "RETIRED", label: "Retired" },
      ],
      placeholder: "All statuses",
    },
  ],
  create: {
    title: "Create Workflow Template",
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
    ],
    useCreate: asMutationHook(useCreateWorkflowTemplateMutation),
  },
  stats: [
    { key: "total", label: "Templates", compute: (rows) => rows.length, icon: <Workflow className="h-5 w-5" /> },
    { key: "published", label: "Published", compute: (rows) => rows.filter((r) => r.status === "PUBLISHED").length, color: "success", icon: <Workflow className="h-5 w-5" /> },
  ],
});

export const WORKFLOW_MANAGEMENT_LISTS: ResourceListConfig[] = [
  { ...templateColumns("Workflow Builder", "Compose and manage automation workflow templates."), path: "/saas-admin/workflow-management/builder" },
  { ...templateColumns("Workflow Templates", "Versioned, reusable automation workflow definitions."), path: "/saas-admin/workflow-management/templates" },
  { ...templateColumns("Automation Rules", "Automation definitions built from workflow templates."), path: "/saas-admin/workflow-management/automation-rules" },
  {
    path: "/saas-admin/workflow-management/scheduled-jobs",
    title: "Scheduled Jobs",
    description: "Scheduled workflow runs queued for execution.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListWorkflowRunsQuery) },
    columns: [
      { key: "id", header: "Run ID", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.runId ?? "—").toString().slice(0, 8))}</span> },
      textCol("template.name", "Template"),
      textCol("resourceType", "Resource"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("startedAt", "Started"),
    ],
    searchable: (r) => `${getField(r, "template.name") ?? ""} ${r.status}`,
    stats: [
      { key: "total", label: "Jobs", compute: (rows) => rows.length, icon: <CalendarDays className="h-5 w-5" /> },
      { key: "running", label: "Running", compute: (rows) => rows.filter((r) => r.status === "RUNNING").length, color: "info", icon: <CalendarDays className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/workflow-management/execution-history",
    title: "Execution History",
    description: "History of workflow executions across tenants.",
    sectionLabel: SECTION,
    rowId: "id",
    source: { kind: "api", useList: asQueryHook(useListWorkflowRunsQuery) },
    columns: [
      { key: "id", header: "Run ID", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.runId ?? "—").toString().slice(0, 8))}</span> },
      textCol("template.name", "Template"),
      textCol("resourceType", "Resource"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("startedAt", "Started"),
      dateCol("completedAt", "Completed"),
    ],
    searchable: (r) => `${getField(r, "template.name") ?? ""} ${r.status}`,
    stats: [
      { key: "total", label: "Executions", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "completed", label: "Completed", compute: (rows) => rows.filter((r) => r.status === "COMPLETED").length, color: "success", icon: <ClipboardList className="h-5 w-5" /> },
      { key: "failed", label: "Failed", compute: (rows) => rows.filter((r) => r.status === "FAILED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];


---
## 8) Route Map (Complete)

Base: `/saas-admin`

### Explicit routes
- dashboard/overview  (relative under /saas-admin/dashboard/overview)
- tenants/all-tenants  (relative under /saas-admin/tenants/all-tenants)
- tenants/create-tenant  (relative under /saas-admin/tenants/create-tenant)
- tenants/details/:tenantId  (relative under /saas-admin/tenants/details/:tenantId)
- tenants/configuration/:tenantId  (relative under /saas-admin/tenants/configuration/:tenantId)
- tenants/status  (relative under /saas-admin/tenants/status)
- staff-management/staff-accounts  (relative under /saas-admin/staff-management/staff-accounts)
- staff-management/staff-accounts/:staffId  (relative under /saas-admin/staff-management/staff-accounts/:staffId)
- staff-management/edit/:staffId  (relative under /saas-admin/staff-management/edit/:staffId)
- staff-management/create-staff  (relative under /saas-admin/staff-management/create-staff)
- staff-management/roles  (relative under /saas-admin/staff-management/roles)
- staff-management/roles/new  (relative under /saas-admin/staff-management/roles/new)
- staff-management/roles/edit/:roleId  (relative under /saas-admin/staff-management/roles/edit/:roleId)
- staff-management/roles/:roleId  (relative under /saas-admin/staff-management/roles/:roleId)
- staff-management/permissions  (relative under /saas-admin/staff-management/permissions)
- staff-management/role-assignment  (relative under /saas-admin/staff-management/role-assignment)
- staff-management/audit-logs  (relative under /saas-admin/staff-management/audit-logs)
- my-account/change-password  (relative under /saas-admin/my-account/change-password)

### Config-driven routes (RESOURCE_LISTS paths)
- /saas-admin/approval-management/pending
- /saas-admin/approval-management/policies
- /saas-admin/approval-management/workflows
- /saas-admin/approval-management/history
- /saas-admin/cmdb-asset-management/cmdb-config
- /saas-admin/cmdb-asset-management/ci-types
- /saas-admin/cmdb-asset-management/asset-categories
- /saas-admin/cmdb-asset-management/lifecycle-rules
- /saas-admin/email-notifications/server-settings
- /saas-admin/email-notifications/templates
- /saas-admin/email-notifications/rules
- /saas-admin/email-notifications/inbound
- /saas-admin/email-notifications/delivery-logs
- /saas-admin/integrations-api/directory
- /saas-admin/integrations-api/api-keys
- /saas-admin/integrations-api/webhooks
- /saas-admin/integrations-api/oauth
- /saas-admin/integrations-api/logs
- /saas-admin/integrations-api/sso
- /saas-admin/itsm-configuration/priority-status
- /saas-admin/itsm-configuration/custom-fields
- /saas-admin/knowledge-management/settings
- /saas-admin/knowledge-management/categories
- /saas-admin/knowledge-management/publishing-rules
- /saas-admin/knowledge-management/moderation
- /saas-admin/my-account/profile
- /saas-admin/my-account/mfa-security
- /saas-admin/my-account/sessions
- /saas-admin/platform-settings/general
- /saas-admin/platform-settings/domains
- /saas-admin/platform-settings/branding
- /saas-admin/platform-settings/localization
- /saas-admin/platform-settings/maintenance
- /saas-admin/reports-analytics/platform-overview
- /saas-admin/reports-analytics/tenant-usage
- /saas-admin/reports-analytics/subscriptions
- /saas-admin/reports-analytics/revenue
- /saas-admin/reports-analytics/staff-activity
- /saas-admin/reports-analytics/audit
- /saas-admin/security-audit/policies
- /saas-admin/security-audit/audit-logs
- /saas-admin/security-audit/suspicious-activity
- /saas-admin/security-audit/data-retention
- /saas-admin/security-audit/login-session
- /saas-admin/security-audit/mfa
- /saas-admin/service-management/catalog
- /saas-admin/service-management/categories
- /saas-admin/service-management/templates
- /saas-admin/service-management/availability
- /saas-admin/sla-management/policies
- /saas-admin/sla-management/targets
- /saas-admin/sla-management/escalation-rules
- /saas-admin/sla-management/breaches
- /saas-admin/support-management/tickets
- /saas-admin/support-management/settings
- /saas-admin/support-management/escalation-policies
- /saas-admin/system-administration/health
- /saas-admin/system-administration/background-jobs
- /saas-admin/system-administration/queues
- /saas-admin/system-administration/database
- /saas-admin/workflow-management/builder
- /saas-admin/workflow-management/templates
- /saas-admin/workflow-management/automation-rules
- /saas-admin/workflow-management/scheduled-jobs
- /saas-admin/workflow-management/execution-history

### Config-driven routes (RESOURCE_PANELS paths)
- /saas-admin/approval-management/pending
- /saas-admin/approval-management/policies
- /saas-admin/approval-management/workflows
- /saas-admin/approval-management/history
- /saas-admin/cmdb-asset-management/cmdb-config
- /saas-admin/cmdb-asset-management/ci-types
- /saas-admin/cmdb-asset-management/asset-categories
- /saas-admin/cmdb-asset-management/lifecycle-rules
- /saas-admin/email-notifications/server-settings
- /saas-admin/email-notifications/templates
- /saas-admin/email-notifications/rules
- /saas-admin/email-notifications/inbound
- /saas-admin/email-notifications/delivery-logs
- /saas-admin/integrations-api/directory
- /saas-admin/integrations-api/api-keys
- /saas-admin/integrations-api/webhooks
- /saas-admin/integrations-api/oauth
- /saas-admin/integrations-api/logs
- /saas-admin/integrations-api/sso
- /saas-admin/itsm-configuration/priority-status
- /saas-admin/itsm-configuration/custom-fields
- /saas-admin/knowledge-management/settings
- /saas-admin/knowledge-management/categories
- /saas-admin/knowledge-management/publishing-rules
- /saas-admin/knowledge-management/moderation
- /saas-admin/my-account/profile
- /saas-admin/my-account/mfa-security
- /saas-admin/my-account/sessions
- /saas-admin/platform-settings/general
- /saas-admin/platform-settings/domains
- /saas-admin/platform-settings/branding
- /saas-admin/platform-settings/localization
- /saas-admin/platform-settings/maintenance
- /saas-admin/reports-analytics/platform-overview
- /saas-admin/reports-analytics/tenant-usage
- /saas-admin/reports-analytics/subscriptions
- /saas-admin/reports-analytics/revenue
- /saas-admin/reports-analytics/staff-activity
- /saas-admin/reports-analytics/audit
- /saas-admin/security-audit/policies
- /saas-admin/security-audit/audit-logs
- /saas-admin/security-audit/suspicious-activity
- /saas-admin/security-audit/data-retention
- /saas-admin/security-audit/login-session
- /saas-admin/security-audit/mfa
- /saas-admin/service-management/catalog
- /saas-admin/service-management/categories
- /saas-admin/service-management/templates
- /saas-admin/service-management/availability
- /saas-admin/sla-management/policies
- /saas-admin/sla-management/targets
- /saas-admin/sla-management/escalation-rules
- /saas-admin/sla-management/breaches
- /saas-admin/support-management/tickets
- /saas-admin/support-management/settings
- /saas-admin/support-management/escalation-policies
- /saas-admin/system-administration/health
- /saas-admin/system-administration/background-jobs
- /saas-admin/system-administration/queues
- /saas-admin/system-administration/database
- /saas-admin/workflow-management/builder
- /saas-admin/workflow-management/templates
- /saas-admin/workflow-management/automation-rules
- /saas-admin/workflow-management/scheduled-jobs
- /saas-admin/workflow-management/execution-history

---
## 9) Nested Pages (Non-Route Views)

- TenantDetailsScreen: tabs Overview, Users, Health, Activity (state activeTab) — each renders dedicated section
- StaffDetailsScreen: stat cards, DetailsGrid, Roles list, Recent Sign-ins DataTable, Administrative Activity DataTable, ConfirmDialog
- StaffEditScreen: Personal/Security/Roles form sections, validation, profile+roles updates
- RoleDetailsScreen: Details dl, Permissions grouped by module (chips), Members DataTable, ConfirmDialog delete
- RoleFormScreen: Basic fields + Permissions grouped by module (checkboxes)
- ResourceListScreen: search/filters, stats, DataTable (columns+actions+quick), Pagination, Modal create with FormGrid
- ConfigPanelScreen: optional stats, FormGrid fields, save/update with toasts
