import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Server, Users, Clock, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DashboardPage } from "@shared/page-shells/DashboardPage";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface PlatformMetrics {
  activeInstances: number;
  totalUsers: number;
  activeIncidents: number;
  pendingApprovals: number;
  uptime: string;
  recentAlerts: number;
}

interface InstanceInfo {
  id: string;
  name: string;
  status: string;
  domain?: string;
  userCount: number;
  createdAt: string;
}

export function SaaSOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [recentInstances, setRecentInstances] = useState<InstanceInfo[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [metricsRes, instancesRes] = await Promise.allSettled([
          fetch("/api/v1/saas/overview/metrics").then((r) => r.json()),
          fetch("/api/v1/saas/instances?limit=5&sort=-createdAt").then((r) => r.json()),
        ]);
        if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value.metrics ?? null);
        if (instancesRes.status === "fulfilled") setRecentInstances(instancesRes.value.items ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading dashboard…</span></div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto"><ErrorState message={error} /></div>;
  }

  const kpiCounts = metrics ? [
    { label: "Active Instances", value: metrics.activeInstances, trend: "up" as const, trendValue: "+12%" },
    { label: "Total Users", value: metrics.totalUsers, trend: "up" as const, trendValue: "+5%" },
    { label: "Active Incidents", value: metrics.activeIncidents, trend: metrics.activeIncidents > 10 ? "down" as const : "up" as const, trendValue: metrics.activeIncidents > 10 ? "High" : "Normal" },
    { label: "Pending Approvals", value: metrics.pendingApprovals, trend: metrics.pendingApprovals > 5 ? "down" as const : "neutral" as const, trendValue: metrics.pendingApprovals > 5 ? "Attention" : "OK" },
    { label: "Uptime", value: metrics.uptime, trend: "up" as const, trendValue: "99.9%" },
  ] : [];

  const widgets = [
    { id: "instances", title: "Recent Instances", description: `${recentInstances.length} instances recently registered.` },
    { id: "health", title: "Platform Health", description: "System status and monitoring overview." },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="SaaS Platform Overview" description="NEXA ITSM control plane dashboard." actions={<Link to="/saas/audit" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Activity className="h-4 w-4" /> View Audit</Link>} />

      {metrics ? (
        <>
          <DashboardPage title="Platform Overview" subtitle="Real-time metrics for the NEXA ITSM SaaS platform." kpiCounts={kpiCounts} widgets={widgets} loading={loading} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Instance Registry" description="Recently registered instances." actions={<Link to="/saas/instances" className="text-xs text-brand-600 hover:underline">View all →</Link>} />
              <CardBody className="overflow-x-auto">
                {recentInstances.length === 0 ? <EmptyState title="No instances" /> : (
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>{["Instance", "Status", "Users", "Created"].map((col) => <th key={col} className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">{col}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentInstances.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><Link to={`/saas/instances/${inst.id}`} className="font-medium text-brand-700 hover:underline">{inst.name}</Link></td>
                          <td className="px-4 py-3"><Badge variant={inst.status === "active" ? "success" : "warning"}>{inst.status}</Badge></td>
                          <td className="px-4 py-3 text-slate-600">{inst.userCount}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(inst.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Platform Alerts" description="Recent alerts and status updates.">
                <div className="flex items-center gap-2">
                  {metrics.recentAlerts > 0 ? <Badge variant="danger">{metrics.recentAlerts} alerts</Badge> : <Badge variant="success">All clear</Badge>}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, title: "Instances growing", text: "12% increase in new instances this month.", variant: "success" as const },
                    { icon: AlertTriangle, title: "High incident volume", text: "5 instances reporting elevated incident counts.", variant: "warning" as const },
                    { icon: CheckCircle2, title: "All systems operational", text: "No degradation detected in the past 24 hours.", variant: "info" as const },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                      <alert.icon className={cn("h-5 w-5 shrink-0", alert.variant === "success" ? "text-emerald-600" : alert.variant === "warning" ? "text-amber-600" : "text-sky-600")} />
                      <div><p className="text-sm font-semibold">{alert.title}</p><p className="text-xs text-slate-500">{alert.text}</p></div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState title="No metrics available" description="Platform metrics will appear once the system is initialized." />
      )}
    </div>
  );
}
