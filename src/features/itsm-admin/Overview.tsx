import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { ActivityStream } from "@shared/components/ActivityStream";
import {
  Settings, AlertTriangle, GitBranch, CalendarDays, BookOpen,
  ShieldCheck, Activity, Network, KeyRound, Bell,
  Wrench, FileText, ClipboardList, Zap, BarChart3,
} from "lucide-react";
import type { ActivityEntry } from "@shared/components/ActivityStream";

interface ModuleCard {
  id: string;
  label: string;
  description: string;
  icon: typeof Settings;
  path: string;
  permission?: string;
  stats?: { label: string; value: string }[];
}

interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  createdAt: string;
}

const moduleCards: Omit<ModuleCard, "stats">[] = [
  { id: "incident", label: "Incident Management", description: "Configure incident types, categories, and workflows", icon: AlertTriangle, path: "incident", permission: "itsm.incident.read" },
  { id: "problem", label: "Problem Management", description: "Manage problem records, root causes, and known errors", icon: GitBranch, path: "problem", permission: "itsm.problem.read" },
  { id: "change", label: "Change Management", description: "Define change types, approval workflows, and CAB", icon: CalendarDays, path: "change", permission: "itsm.change.read" },
  { id: "catalog", label: "Service Catalog", description: "Manage catalog categories, items, and fulfillment", icon: BookOpen, path: "catalog", permission: "itsm.catalog.read" },
  { id: "knowledge", label: "Knowledge Base", description: "Configure knowledge bases, articles, and review policies", icon: BookOpen, path: "knowledge", permission: "itsm.knowledge.read" },
  { id: "sla", label: "SLA / OLA Configuration", description: "Define service level agreements and operational level agreements", icon: ShieldCheck, path: "sla", permission: "itsm.sla.read" },
  { id: "routing", label: "Routing & Assignment", description: "Configure assignment rules, queues, skills, and fallback", icon: Network, path: "routing", permission: "itsm.routing.read" },
  { id: "approvals", label: "Approvals", description: "Manage approval policies, rules, delegation, and audit", icon: KeyRound, path: "approvals", permission: "itsm.approval.read" },
  { id: "on-call", label: "On-Call Management", description: "Configure on-call schedules, rotations, and escalation paths", icon: Activity, path: "on-call", permission: "itsm.oncall.read" },
  { id: "cmdb", label: "CMDB & Services", description: "Manage services, CI classes, relationships, and health", icon: Activity, path: "cmdb", permission: "itsm.cmdb.read" },
  { id: "release", label: "Release Management", description: "Configure release pipelines, stages, and deployment policies", icon: CalendarDays, path: "release", permission: "itsm.release.read" },
  { id: "improvement", label: "Improvement", description: "Manage improvement records, proposals, and tracking", icon: GitBranch, path: "improvement", permission: "itsm.improvement.read" },
  { id: "outage", label: "Outage Management", description: "Configure outage policies, schedules, and notifications", icon: AlertTriangle, path: "outage", permission: "itsm.outage.read" },
  { id: "forms-fields", label: "Forms & Fields", description: "Configure form layouts, fields, and validation rules", icon: ClipboardList, path: "forms-fields", permission: "itsm.forms.read" },
  { id: "templates", label: "Templates", description: "Manage notification and email templates", icon: FileText, path: "templates", permission: "itsm.templates.read" },
  { id: "notifications", label: "Notifications", description: "Configure notification rules, delivery logs, and failures", icon: Bell, path: "notifications", permission: "itsm.notifications.read" },
  { id: "automation", label: "Automation", description: "Define automation rules, triggers, and actions", icon: Zap, path: "automation", permission: "itsm.automation.read" },
  { id: "reports", label: "Reports", description: "Configure ITSM reports, dashboards, and analytics", icon: BarChart3, path: "reports", permission: "itsm.reports.read" },
  { id: "audit", label: "Audit", description: "View ITSM audit logs and compliance tracking", icon: Wrench, path: "audit", permission: "itsm.core.audit_read" },
];

const recentActivity: ActivityEntry[] = [
  { id: "1", actor: "Admin", action: "Updated Incident SLA policy", timestamp: new Date().toISOString() },
  { id: "2", actor: "System", action: "Created new catalog category", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", actor: "Admin", action: "Changed approval rule", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export function Overview() {
  const navigate = useNavigate();
  const permissions = useAppSelector(selectPermissions);
  const [searchValue, setSearchValue] = useState("");
  const [loading] = useState(false);

  const visibleModules = useMemo(
    () => moduleCards.filter((m) => !m.permission || can(permissions, m.permission)),
    [permissions]
  );

  const filteredModules = useMemo(
    () => searchValue
      ? visibleModules.filter((m) => m.label.toLowerCase().includes(searchValue.toLowerCase()) || m.description.toLowerCase().includes(searchValue.toLowerCase()))
      : visibleModules,
    [visibleModules, searchValue]
  );

  const handleModuleClick = (path: string) => {
    showSuccess("Navigation", `Opening ${path} configuration`);
    navigate(`/instances/${useParams().instanceId}/itsm-admin/${path}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ITSM Admin Dashboard"
        description="Configure and manage all ITSM modules, policies, and shared settings"
        actions={
          <Button onClick={() => showSuccess("Dashboard", "Dashboard refreshed")}>Refresh</Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <Spinner className="h-6 w-6 mx-auto" />
        ) : filteredModules.length === 0 ? (
          <EmptyState title="No modules found" description="Try a different search term" />
        ) : (
          filteredModules.map((module) => {
            const Icon = module.icon;
            const hasPermission = !module.permission || can(permissions, module.permission);
            return (
              <button
                key={module.id}
                onClick={() => hasPermission && navigate(`/instances/${useParams().instanceId}/itsm-admin/${module.path}`)}
                disabled={!hasPermission}
                className={cn(
                  "group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:shadow-md hover:border-brand-300",
                  !hasPermission && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-lg p-2", "bg-brand-50 text-brand-600", "group-hover:bg-brand-100")}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={hasPermission ? "success" : "muted"}>{hasPermission ? "Active" : "Restricted"}</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{module.label}</h3>
                <p className="mt-1 text-xs text-slate-500">{module.description}</p>
              </button>
            );
          })
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Activity" description="Latest ITSM configuration changes" />
          <CardBody>
            <ActivityStream entries={recentActivity} loading={loading} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Quick Stats" />
          <CardBody>
            <div className="space-y-4">
              {[
                { label: "Active Incidents", value: "24", variant: "info" as const },
                { label: "Open Changes", value: "8", variant: "warning" as const },
                { label: "Problems", value: "5", variant: "danger" as const },
                { label: "Catalog Items", value: "142", variant: "success" as const },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{stat.label}</span>
                  <Badge variant={stat.variant}>{stat.value}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function useParams() {
  return { instanceId: "demo" };
}
