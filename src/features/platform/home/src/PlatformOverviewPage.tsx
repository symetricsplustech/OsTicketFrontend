import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Server, CheckCircle2, XCircle, Users, AlertTriangle,
  Activity, Shield, Clock, Zap, Wrench, BarChart3,
  ArrowUpRight, ArrowDownRight, RefreshCw, Search,
  Filter, MoreVertical,
} from "lucide-react";
import {
  Card, CardBody, CardHeader, Button, Badge,
  EmptyState, ErrorState, PageLoader, Spinner,
  DataTable, Pagination,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { DashboardPage } from "@page-shells/DashboardPage";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth, selectPermissions } from "@shared/auth/authSlice";
import { useMyInstancesQuery } from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime } from "@shared/lib/format";
import { ActivityStream } from "@shared/components/ActivityStream";

interface PlatformMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

interface ProvisioningFailure {
  id: string;
  instanceName: string;
  error: string;
  timestamp: string;
  status: "failed" | "retrying" | "blocked";
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  timestamp: string;
  actor: string;
}

interface PrivilegedActivity {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
}

interface JobHealth {
  id: string;
  worker: string;
  queue: string;
  activeJobs: number;
  failedJobs: number;
  status: "healthy" | "degraded" | "down";
}

export function PlatformOverviewPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const permissions = useAppSelector(selectPermissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: instancesData } = useMyInstancesQuery(undefined, { skip: !auth.token });

  const totalInstances = instancesData?.instances?.length ?? 0;
  const activeInstances = instancesData?.instances?.filter((i: any) => i.instanceStatus === "active").length ?? 0;

  const metrics: PlatformMetric[] = useMemo(() => [
    { label: "Total Instances", value: totalInstances, trend: "up", trendValue: "+12%", icon: <Server className="h-5 w-5" />, color: "bg-brand-50 text-brand-700" },
    { label: "Active Instances", value: activeInstances, trend: "up", trendValue: "+8%", icon: <CheckCircle2 className="h-5 w-5" />, color: "bg-emerald-50 text-emerald-700" },
    { label: "Platform Users", value: "2,847", trend: "up", trendValue: "+5%", icon: <Users className="h-5 w-5" />, color: "bg-sky-50 text-sky-700" },
    { label: "Provisioning Failures", value: 3, trend: "down", trendValue: "-3", icon: <AlertTriangle className="h-5 w-5" />, color: "bg-amber-50 text-amber-700" },
    { label: "Job Health", value: "98.2%", trend: "neutral", trendValue: "0%", icon: <Activity className="h-5 w-5" />, color: "bg-purple-50 text-purple-700" },
    { label: "Security Events", value: 47, trend: "down", trendValue: "-15", icon: <Shield className="h-5 w-5" />, color: "bg-red-50 text-red-700" },
    { label: "Recent Privileged Activity", value: 12, trend: "neutral", trendValue: "—", icon: <Zap className="h-5 w-5" />, color: "bg-orange-50 text-orange-700" },
  ], [totalInstances, activeInstances]);

  const provisioningFailures: ProvisioningFailure[] = [
    { id: "1", instanceName: "staging-acme", error: "Domain verification failed", timestamp: "2024-01-15T10:30:00Z", status: "failed" },
    { id: "2", instanceName: "demo-beta", error: "Module provisioning timeout", timestamp: "2024-01-15T09:15:00Z", status: "retrying" },
    { id: "3", instanceName: "legacy-prod", error: "SSL certificate expired", timestamp: "2024-01-14T16:45:00Z", status: "blocked" },
  ];

  const securityEvents: SecurityEvent[] = [
    { id: "1", type: "Unauthorized Access Attempt", severity: "critical", description: "Multiple failed login attempts detected", timestamp: "2024-01-15T11:00:00Z", actor: "System" },
    { id: "2", type: "Permission Escalation", severity: "high", description: "User attempted privilege escalation", timestamp: "2024-01-15T10:30:00Z", actor: "admin@acme.com" },
    { id: "3", type: "MFA Bypass Attempt", severity: "high", description: "MFA verification bypass detected", timestamp: "2024-01-15T09:00:00Z", actor: "System" },
    { id: "4", type: "IP Whitelist Violation", severity: "medium", description: "Access from unauthorized IP range", timestamp: "2024-01-14T22:00:00Z", actor: "192.168.1.100" },
  ];

  const privilegedActivities: PrivilegedActivity[] = [
    { id: "1", actor: "superadmin", action: "Created role", resource: "Admin Role", timestamp: "2024-01-15T11:00:00Z" },
    { id: "2", actor: "ops-manager", action: "Modified permissions", resource: "Platform Permissions", timestamp: "2024-01-15T10:30:00Z" },
    { id: "3", actor: "security-admin", action: "Reviewed audit log", resource: "Audit Trail", timestamp: "2024-01-15T09:15:00Z" },
  ];

  const jobHealth: JobHealth[] = [
    { id: "1", worker: "worker-prod-1", queue: "default", activeJobs: 23, failedJobs: 1, status: "healthy" },
    { id: "2", worker: "worker-prod-2", queue: "high-priority", activeJobs: 5, failedJobs: 0, status: "healthy" },
    { id: "3", worker: "worker-prod-3", queue: "scheduled", activeJobs: 0, failedJobs: 3, status: "degraded" },
    { id: "4", worker: "worker-staging", queue: "default", activeJobs: 0, failedJobs: 5, status: "down" },
  ];

  const filteredFailures = provisioningFailures.filter((f) =>
    f.instanceName.toLowerCase().includes(search.toLowerCase()) || f.error.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "instanceName", header: "Instance", render: (row: ProvisioningFailure) => <span className="font-medium text-slate-900">{row.instanceName}</span> },
    { key: "error", header: "Error", render: (row: ProvisioningFailure) => <span className="text-slate-600">{row.error}</span> },
    { key: "status", header: "Status", render: (row: ProvisioningFailure) => <Badge variant={row.status === "failed" ? "danger" : row.status === "retrying" ? "warning" : "muted"}>{row.status}</Badge> },
    { key: "timestamp", header: "Time", render: (row: ProvisioningFailure) => <span className="text-slate-500">{formatDateTime(row.timestamp)}</span> },
  ];

  if (loading) {
    return <PageLoader label="Loading platform overview…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Platform Overview"
        description="SaaS platform administration dashboard"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ArrowUpRight className="h-3 w-3" /><span>Overview</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search platform…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Refresh</Button>
          </div>
        }
      />

      {/* KPI Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="hover:shadow-md transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
                </div>
                <div className={cn("grid h-10 w-10 place-items-center rounded-lg", metric.color)}>
                  {metric.icon}
                </div>
              </div>
              {metric.trendValue && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {metric.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : metric.trend === "down" ? <ArrowDownRight className="h-3 w-3 text-emerald-500" /> : null}
                  <span className={metric.trend === "up" ? "text-emerald-600" : metric.trend === "down" ? "text-emerald-600" : "text-slate-500"}>{metric.trendValue}</span>
                  <span className="text-slate-400">vs last period</span>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Provisioning Failures */}
        <Card>
          <CardHeader
            title="Provisioning Failures"
            description="Failed instance provisioning attempts"
            actions={<Badge variant="danger">{provisioningFailures.length} issues</Badge>}
          />
          <CardBody>
            {filteredFailures.length === 0 ? (
              <EmptyState title="No provisioning failures" description="All instances are provisioning successfully." />
            ) : (
              <DataTable columns={columns} rows={filteredFailures} rowKey={(r) => r.id} />
            )}
          </CardBody>
        </Card>

        {/* Job Health */}
        <Card>
          <CardHeader
            title="Job Health"
            description="Worker and queue status overview"
          />
          <CardBody>
            <div className="space-y-3">
              {jobHealth.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{job.worker}</p>
                    <p className="text-xs text-slate-500">Queue: {job.queue}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600">{job.activeJobs} active</span>
                    <span className={cn("font-medium", job.failedJobs > 0 ? "text-red-600" : "text-emerald-600")}>{job.failedJobs} failed</span>
                    <Badge variant={job.status === "healthy" ? "success" : job.status === "degraded" ? "warning" : "danger"}>{job.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader
            title="Security Events"
            description="Recent security alerts and events"
            actions={<Badge variant="danger">{securityEvents.filter((e) => e.severity === "critical" || e.severity === "high").length} urgent</Badge>}
          />
          <CardBody>
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                  <div className={cn(
                    "mt-0.5 grid h-2 w-2 place-items-center rounded-full",
                    event.severity === "critical" ? "bg-red-500" : event.severity === "high" ? "bg-orange-500" : event.severity === "medium" ? "bg-amber-500" : "bg-slate-400"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{event.type}</p>
                      <Badge variant={event.severity === "critical" ? "danger" : event.severity === "high" ? "warning" : "muted"}>{event.severity}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{event.actor} · {formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Privileged Activity */}
        <Card>
          <CardHeader
            title="Recent Privileged Activity"
            description="High-risk administrative actions"
          />
          <CardBody>
            <ActivityStream
              entries={privilegedActivities.map((a) => ({
                id: a.id,
                actor: a.actor,
                action: a.action,
                resource: a.resource,
                timestamp: a.timestamp,
              }))}
              emptyDescription="No privileged activity recorded"
            />
          </CardBody>
        </Card>
      </div>

      {/* Permission Gate for admin-only actions */}
      <PermissionGate permissions={["platform.admin", "*"]} fallback={null}>
        <Card className="mt-6">
          <CardHeader
            title="Platform Administration"
            description="Admin-only controls and configurations"
            actions={<Button size="sm">Manage Platform</Button>}
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Instance Registry", desc: "Manage all platform instances", icon: <Server className="h-5 w-5" /> },
                { label: "Platform Users", desc: "View and manage all users", icon: <Users className="h-5 w-5" /> },
                { label: "SaaS Operators", desc: "Manage operators and roles", icon: <Shield className="h-5 w-5" /> },
                { label: "Platform Settings", desc: "Global platform configuration", icon: <Wrench className="h-5 w-5" /> },
              ].map((item) => (
                <Link key={item.label} to={`/saas/${item.label.toLowerCase().replace(" ", "-")}`} className="rounded-lg border border-slate-200 p-4 hover:border-brand-400 hover:bg-brand-50">
                  <div className={cn("grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700")}>{item.icon}</div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </PermissionGate>
    </div>
  );
}

// Import Input component for search
import { Input } from "@shared/components/ui";
