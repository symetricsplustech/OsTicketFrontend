import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Edit, Settings, FileText, Users, ShieldCheck, Link as LinkIcon, Activity, PauseCircle, PlayCircle, Globe, Clock, RefreshCw, Plus, Check, Ban, Trash2 } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState, Input } from "@components/common/ui";
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
  useListTenantDomainsQuery,
  useCreateTenantDomainMutation,
  useVerifyTenantDomainMutation,
  useActivateTenantDomainMutation,
  useDisableTenantDomainMutation,
  useDeleteTenantDomainMutation,
  useTenantProvisioningStatusQuery,
  useProvisionTenantMutation,
  apiErrorMessage,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "users", label: "Users", icon: Users },
  { key: "domains", label: "Domains", icon: Globe },
  { key: "health", label: "Health", icon: ShieldCheck },
  { key: "lifecycle", label: "Lifecycle", icon: Clock },
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
  const domainsQuery = useListTenantDomainsQuery(tenantId ?? "", { skip: !tenantId || activeTab !== "domains" });
  const [createDomain] = useCreateTenantDomainMutation();
  const [verifyDomain] = useVerifyTenantDomainMutation();
  const [activateDomain] = useActivateTenantDomainMutation();
  const [disableDomain] = useDisableTenantDomainMutation();
  const [deleteDomain] = useDeleteTenantDomainMutation();
  const provisioningQuery = useTenantProvisioningStatusQuery(tenantId ?? "", { skip: !tenantId || activeTab !== "lifecycle" });
  const [provisionTenant] = useProvisionTenantMutation();

  const [newDomain, setNewDomain] = useState("");
  const [domainBusy, setDomainBusy] = useState(false);
  const [domainDialog, setDomainDialog] = useState<{ id: string; domain: string; action: "disable" | "delete" } | null>(null);
  const [provisionBusy, setProvisionBusy] = useState(false);

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

  const handleAddDomain = async () => {
    if (!tenantId) return;
    const domain = newDomain.trim().toLowerCase();
    if (!domain) return;
    setDomainBusy(true);
    try {
      await createDomain({ tenantId, body: { domain } }).unwrap();
      toast.success("Domain added. Complete DNS verification to activate it.");
      setNewDomain("");
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setDomainBusy(false);
    }
  };

  const handleDomainAction = async (domainId: string, action: "verify" | "activate") => {
    if (!tenantId) return;
    setDomainBusy(true);
    try {
      if (action === "verify") await verifyDomain({ tenantId, domainId }).unwrap();
      else await activateDomain({ tenantId, domainId }).unwrap();
      toast.success(action === "verify" ? "Verification requested." : "Domain activated.");
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setDomainBusy(false);
    }
  };

  const handleDomainConfirm = async () => {
    if (!tenantId || !domainDialog) return;
    setDomainBusy(true);
    try {
      if (domainDialog.action === "disable") await disableDomain({ tenantId, domainId: domainDialog.id }).unwrap();
      else await deleteDomain({ tenantId, domainId: domainDialog.id }).unwrap();
      toast.success(domainDialog.action === "disable" ? "Domain disabled." : "Domain removed.");
      setDomainDialog(null);
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setDomainBusy(false);
    }
  };

  const handleProvision = async () => {
    if (!tenantId) return;
    setProvisionBusy(true);
    try {
      await provisionTenant({ tenantId }).unwrap();
      toast.success("Provisioning run started.");
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setProvisionBusy(false);
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

  const renderDomains = () => {
    const payload = (domainsQuery.data?.data ?? []) as ApiRecord[];
    const variantFor = (s: string): StatusVariant => {
      switch (s.toUpperCase()) {
        case "ACTIVE": return "active";
        case "VERIFIED": return "enabled";
        case "PENDING_VERIFICATION": return "pending";
        case "DISABLED": return "suspended";
        case "FAILED": return "disabled";
        default: return "default";
      }
    };
    const rows = payload.map((row) => ({
      id: String(row.id),
      domain: String(row.domain ?? ""),
      type: String(row.type ?? ""),
      status: String(row.status ?? ""),
      verifiedAt: row.verifiedAt ? String(row.verifiedAt) : "",
      lastError: row.lastError ? String(row.lastError) : "",
    }));
    const columns = [
      { key: "domain", header: "Domain", render: (r: typeof rows[number]) => <span className="font-mono text-sm text-slate-900">{r.domain}</span> },
      { key: "type", header: "Type", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.type || "—"}</span> },
      { key: "status", header: "Status", render: (r: typeof rows[number]) => <StatusBadge status={r.status.replace(/_/g, " ").toLowerCase()} variant={variantFor(r.status)} size="sm" />, sortable: true },
      { key: "verifiedAt", header: "Verified", render: (r: typeof rows[number]) => <span className="text-sm text-slate-700">{r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString() : "—"}</span> },
    ];
    const actions = [
      { label: "Verify", icon: <RefreshCw className="h-3.5 w-3.5" />, show: (r: typeof rows[number]) => r.status === "PENDING_VERIFICATION", onClick: (r: typeof rows[number]) => handleDomainAction(r.id, "verify") },
      { label: "Activate", icon: <Check className="h-3.5 w-3.5" />, show: (r: typeof rows[number]) => r.status === "VERIFIED", onClick: (r: typeof rows[number]) => handleDomainAction(r.id, "activate") },
      { label: "Disable", icon: <Ban className="h-3.5 w-3.5" />, variant: "danger" as const, show: (r: typeof rows[number]) => r.status === "ACTIVE", onClick: (r: typeof rows[number]) => setDomainDialog({ id: r.id, domain: r.domain, action: "disable" }) },
      { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, variant: "danger" as const, onClick: (r: typeof rows[number]) => setDomainDialog({ id: r.id, domain: r.domain, action: "delete" }) },
    ];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-slate-700">Add custom domain</span>
            <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value.toLowerCase())} placeholder="portal.acme.com" />
          </label>
          <Button onClick={handleAddDomain} loading={domainBusy} disabled={!newDomain.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add Domain
          </Button>
        </div>
        {domainsQuery.isError ? (
          <ErrorState message="Could not load tenant domains." />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={domainsQuery.isLoading} actions={actions} emptyTitle="No domains" emptyDescription="No custom domains configured for this tenant." />
        )}
      </div>
    );
  };

  const renderLifecycle = () => {
    if (provisioningQuery.isError) return <ErrorState message="Could not load provisioning status." />;
    if (provisioningQuery.isLoading) return <p className="text-sm text-slate-500">Loading provisioning status…</p>;
    const payload = provisioningQuery.data?.data as ApiRecord | undefined;
    const tenantInfo = (payload?.tenant ?? {}) as ApiRecord;
    const latest = (payload?.latestRun ?? undefined) as ApiRecord | undefined;
    const jobs = (payload?.recentJobs ?? []) as ApiRecord[];
    const steps = (latest?.steps ?? []) as ApiRecord[];
    const provisioningStatus = String(tenantInfo.provisioningStatus ?? tenant?.provisioningStatus ?? "NOT_STARTED");
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Provisioning" value={provisioningStatus} color={provisioningStatus === "COMPLETED" ? "success" : provisioningStatus === "FAILED" ? "danger" : "warning"} />
          <StatCard label="Attempts" value={Number(tenantInfo.provisionAttempts ?? 0)} />
          <StatCard label="Provisioned" value={tenantInfo.provisionedAt ? new Date(String(tenantInfo.provisionedAt)).toLocaleDateString() : "—"} />
          <StatCard label="Current Status" value={status || "—"} />
        </div>

        {tenantInfo.provisionError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Last error: {String(tenantInfo.provisionError)}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button onClick={handleProvision} loading={provisionBusy}>
            <RefreshCw className="h-4 w-4 mr-1" /> {provisioningStatus === "COMPLETED" ? "Re-run provisioning" : "Run / retry provisioning"}
          </Button>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Latest run steps</h3>
          {steps.length === 0 ? (
            <p className="text-sm text-slate-500">No provisioning steps recorded yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {steps.map((step, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="font-medium capitalize text-slate-800">{String(step.step ?? "step")}</span>
                  <span className="flex items-center gap-2 text-slate-500">
                    {step.detail ? String(step.detail) : null}
                    <StatusBadge status={String(step.status ?? "")} variant={String(step.status) === "ok" ? "active" : "disabled"} size="sm" />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Provisioning jobs</h3>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500">No provisioning jobs recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {jobs.map((job) => (
                <li key={String(job.id)} className="flex items-center justify-between py-2">
                  <span className="font-mono text-xs text-slate-600">{String(job.id)}</span>
                  <span className="flex items-center gap-3 text-slate-500">
                    <span>attempts: {Number(job.attempts ?? 0)}</span>
                    <StatusBadge status={String(job.status ?? "")} variant={String(job.status) === "COMPLETED" ? "active" : String(job.status) === "FAILED" ? "disabled" : "pending"} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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
      {activeTab === "domains" ? renderDomains() : null}
      {activeTab === "health" ? renderHealth() : null}
      {activeTab === "lifecycle" ? renderLifecycle() : null}
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

      <ConfirmDialog
        isOpen={!!domainDialog}
        onClose={() => setDomainDialog(null)}
        onConfirm={handleDomainConfirm}
        loading={domainBusy}
        title={domainDialog?.action === "delete" ? "Delete Domain" : "Disable Domain"}
        message={
          domainDialog?.action === "delete"
            ? `Permanently remove "${domainDialog?.domain}"? Users will no longer be able to reach the tenant through this domain.`
            : `Disable "${domainDialog?.domain}"? It will stop resolving until re-activated.`
        }
        confirmLabel={domainDialog?.action === "delete" ? "Delete" : "Disable"}
        variant="danger"
      />
    </SaasAdminScreen>
  );
}
