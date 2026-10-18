import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  LifeBuoy,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  Server,
  ShieldAlert,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ErrorState } from "@components/common/ui";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { StatusBadge } from "@/screens/saas-admin/components/ui";
import {
  useDashboardSummaryQuery,
  useDashboardRecentActivityQuery,
  useDashboardAlertsQuery,
  useDashboardTenantGrowthQuery,
  useDashboardTenantStatusQuery,
  useDashboardPlatformHealthQuery,
  useDashboardWorkQueueQuery,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";
import { SAAS_ADMIN_NAVIGATION } from "@/navigation/saasAdminNavigation";

const NAV_PATHS = SAAS_ADMIN_NAVIGATION.flatMap((section) => section.items.map((item) => item.path));

function resolveAlertLink(link: unknown): string | null {
  const value = typeof link === "string" ? link : "";
  if (!value.startsWith("/saas-admin/")) return null;
  return NAV_PATHS.some((path) => value === path || value.startsWith(`${path}/`)) ? value : null;
}

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
  icon: ReactNode;
  onClick?: () => void;
}

const TONE: Record<NonNullable<MetricProps["tone"]>, string> = {
  default: "text-slate-900",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

function Metric({ label, value, hint, tone = "default", icon, onClick }: MetricProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm${onClick ? " transition hover:border-brand-300 hover:shadow" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${TONE[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </Component>
  );
}

const SEVERITY_VARIANT: Record<string, "active" | "pending" | "suspended" | "default"> = {
  info: "default",
  warning: "pending",
  critical: "suspended",
};

export function DashboardOverviewScreen() {
  const navigate = useNavigate();
  const summary = useDashboardSummaryQuery();
  const activity = useDashboardRecentActivityQuery();
  const alerts = useDashboardAlertsQuery();
  const growth = useDashboardTenantGrowthQuery({ days: 90 });
  const tenantStatus = useDashboardTenantStatusQuery();
  const platformHealth = useDashboardPlatformHealthQuery();
  const workQueue = useDashboardWorkQueueQuery();

  const s = summary.data?.data as ApiRecord | undefined;
  const events = (activity.data?.data ?? []) as ApiRecord[];
  const alertList = (((alerts.data?.data as ApiRecord | undefined)?.alerts ?? []) as ApiRecord[]);
  const health = platformHealth.data?.data as ApiRecord | undefined;
  const breakdown = ((tenantStatus.data?.data as ApiRecord | undefined)?.byStatus ?? []) as ApiRecord[];
  const growthSeries = ((((growth.data?.data as ApiRecord | undefined)?.series) ?? []) as ApiRecord[]).map((row) => ({
    period: String(row.period ?? ""),
    created: Number(row.created ?? 0),
    cumulative: Number(row.cumulativeTenants ?? 0),
  }));
  const wq = workQueue.data?.data as ApiRecord | undefined;

  const totalTenants = Number(readRecord(s, "tenants", "total") ?? 0);
  const activeTenants = Number(readRecord(s, "tenants", "active") ?? 0);
  const activePercent = totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0;

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
              value={summary.isLoading ? "…" : num(totalTenants)}
              hint={`${activePercent}% active`}
              icon={<Building2 className="h-4 w-4" />}
              onClick={() => navigate("/saas-admin/tenants/all-tenants")}
            />
            <Metric
              label="Active Staff"
              value={summary.isLoading ? "…" : num(readRecord(s, "staff", "active"))}
              hint={`${num(readRecord(s, "staff", "mfaAdoptionPercent"))}% MFA adoption`}
              tone="success"
              icon={<Users className="h-4 w-4" />}
              onClick={() => navigate("/saas-admin/staff-management/staff-accounts")}
            />
            <Metric
              label="Open Tickets"
              value={summary.isLoading ? "…" : num(readRecord(s, "support", "openTickets"))}
              tone="warning"
              icon={<LifeBuoy className="h-4 w-4" />}
              onClick={() => navigate("/saas-admin/support-management/tickets")}
            />
            <Metric
              label="Pending Approvals"
              value={summary.isLoading ? "…" : num(readRecord(s, "approvals", "pending"))}
              tone={Number(readRecord(s, "approvals", "pending") ?? 0) > 0 ? "danger" : "default"}
              icon={<ClipboardCheck className="h-4 w-4" />}
              onClick={() => navigate("/saas-admin/approval-management/pending")}
            />
            <Metric
              label="Platform Health"
              value={platformHealth.isLoading ? "…" : String(health?.status ?? "—")}
              hint={health?.environment ? `${String(health.environment)} · v${String(health.version ?? "")}` : undefined}
              tone={health?.status === "healthy" ? "success" : health?.status === "down" ? "danger" : "warning"}
              icon={<Server className="h-4 w-4" />}
              onClick={() => navigate("/saas-admin/system-administration/health")}
            />
          </div>
        )}

        {(alerts.data || alerts.isLoading) ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>
              {alertList.length > 0 ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{alertList.length}</span>
              ) : null}
            </div>
            {alerts.isLoading ? (
              <p className="mt-3 text-sm text-slate-500">Loading alerts…</p>
            ) : alerts.isError ? (
              <p className="mt-3 text-sm text-red-600">Could not load alerts.</p>
            ) : alertList.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No active alerts. Platform is nominal.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {alertList.map((alert) => (
                  <li key={String(alert.id)} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{String(alert.title ?? "")}</p>
                      {alert.detail ? <p className="text-xs text-slate-500">{String(alert.detail)}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={String(alert.severity ?? "info")} variant={SEVERITY_VARIANT[String(alert.severity)] ?? "default"} size="sm" />
                      {resolveAlertLink(alert.link) ? (
                        <button type="button" onClick={() => navigate(resolveAlertLink(alert.link) as string)} className="text-xs font-medium text-brand-600 hover:underline">
                          View
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Tenant Growth (90d)</h3>
            {growth.isLoading ? (
              <p className="text-sm text-slate-500">Loading chart…</p>
            ) : growth.isError ? (
              <p className="text-sm text-red-600">Could not load tenant growth.</p>
            ) : growthSeries.length === 0 ? (
              <p className="text-sm text-slate-500">No tenant growth data for this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthSeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="created" name="New" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Tenants by Status</h3>
            {tenantStatus.isLoading ? (
              <p className="text-sm text-slate-500">Loading breakdown…</p>
            ) : tenantStatus.isError ? (
              <p className="text-sm text-red-600">Could not load status breakdown.</p>
            ) : breakdown.length === 0 ? (
              <p className="text-sm text-slate-500">No tenants recorded.</p>
            ) : (
              <ul className="space-y-2">
                {breakdown.map((row) => {
                  const count = Number(row.count ?? 0);
                  const pct = totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0;
                  return (
                    <li key={String(row.status)} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">{String(row.status)}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Work Queue</h3>
          {workQueue.isLoading ? (
            <p className="text-sm text-slate-500">Loading work queue…</p>
          ) : workQueue.isError ? (
            <p className="text-sm text-red-600">Could not load the work queue.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Pending Approvals" value={num(readRecord(wq, "counts", "pendingApprovals"))} icon={<ClipboardCheck className="h-4 w-4" />} onClick={() => navigate("/saas-admin/approval-management/requests")} />
              <Metric label="Open Tickets" value={num(readRecord(wq, "counts", "openSupportTickets"))} icon={<LifeBuoy className="h-4 w-4" />} onClick={() => navigate("/saas-admin/support-management/tickets")} />
              <Metric
                label="Failed Jobs"
                value={num(readRecord(wq, "counts", "failedJobs"))}
                tone={Number(readRecord(wq, "counts", "failedJobs") ?? 0) > 0 ? "danger" : "default"}
                icon={<ShieldAlert className="h-4 w-4" />}
                onClick={() => navigate("/saas-admin/system-administration/background-jobs")}
              />
            </div>
          )}
        </section>

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
