import { useState, useMemo } from "react";
import {
  Activity, AlertTriangle, Clock3, CheckCircle2, FileText,
  Inbox, Layers3, Search, Sparkles, Wrench,
} from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { DashboardPage } from "@page-shells/DashboardPage";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
  icon: typeof Activity;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const myActiveWork: Record<string, { id: string; title: string; state: string; priority: string; due?: string }[]> = {
  assigned: [
    { id: "INC001042", title: "VPN access fails after password reset", state: "In Progress", priority: "P2", due: "Today, 17:42" },
    { id: "INC001039", title: "Finance printer unavailable on level 4", state: "Assigned", priority: "P3", due: "Tomorrow" },
  ],
  opened: [
    { id: "REQ002204", title: "New laptop and development software", state: "Pending Approval", priority: "P3", due: "—" },
  ],
  watching: [
    { id: "CHG000882", title: "Upgrade customer identity gateway", state: "Scheduled", priority: "P2", due: "Fri, 14:00" },
    { id: "PRB000401", title: "Recurring authentication latency", state: "Root Cause", priority: "P1", due: "—" },
  ],
  scheduled: [
    { id: "CHG000890", title: "Quarterly security patch deployment", state: "Scheduled", priority: "P1", due: "Sat, 02:00" },
  ],
  waiting: [
    { id: "REQ002210", title: "Waiting on customer response", state: "Waiting", priority: "P4", due: "—" },
  ],
  completed: [
    { id: "INC001030", title: "Network connectivity restored", state: "Resolved", priority: "P2", due: "—" },
    { id: "INC001028", title: "Email forwarding configured", state: "Closed", priority: "P3", due: "—" },
  ],
};

export function WorkspaceHome() {
  const permissions = useAppSelector(selectPermissions);
  const [activeTab, setActiveTab] = useState("myWork");

  const stats: StatCard[] = useMemo(() => [
    { label: "My Active Work", value: "12", trend: "+3", icon: Inbox, variant: "info" },
    { label: "SLA At Risk", value: "5", trend: "-2", icon: AlertTriangle, variant: "warning" },
    { label: "Overdue", value: "3", trend: "+1", icon: Clock3, variant: "danger" },
    { label: "Pending Approvals", value: "8", trend: "-4", icon: CheckCircle2, variant: "success" },
  ], []);

  const majorIncidents = [
    { id: "MIT00001", title: "Production database outage", severity: "P1", status: "Active" },
    { id: "MIT00002", title: "Customer portal authentication failure", severity: "P2", status: "Monitoring" },
  ];

  const knowledgeSuggestions = [
    { id: "KB001", title: "How to reset VPN credentials", category: "VPN" },
    { id: "KB002", title: "Printer troubleshooting guide", category: "Hardware" },
  ];

  const tabs = [
    { id: "myWork", label: "My Active Work" },
    { id: "groupQueue", label: "Group Queue" },
    { id: "slaRisk", label: "SLA At Risk" },
    { id: "incidents", label: "Major Incidents" },
    { id: "knowledge", label: "Knowledge Suggestions" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineer Workspace"
        description="Overview of your active work, group queue, SLA risks, and suggested knowledge articles."
        actions={
          <div className="flex gap-2">
            <PermissionGate permissions={["itsm.incident.create"]}>
              <Button>New Incident</Button>
            </PermissionGate>
            <Button variant="outline">Refresh</Button>
          </div>
        }
      />

      <DashboardPage
        title="Dashboard"
        kpiCounts={stats.map((s) => ({
          label: s.label,
          value: s.value,
          trend: s.trend as any,
        }))}
        loading={false}
      />

      <Tabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {activeTab === "myWork" && (
          <Card>
            <CardHeader title="My Active Work" description="Your assigned, opened, and watched records.">
              <div className="space-y-4 mt-4">
                {Object.entries(myActiveWork).map(([tab, items]) => (
                  items.length > 0 ? <div key={tab}>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{tab.replace(/([A-Z])/g, " $1")}</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-cyan-50">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-[10px] text-slate-500">{item.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.state === "In Progress" ? "info" : item.state === "Resolved" ? "success" : "warning"}>{item.state}</Badge>
                            <span className="text-xs font-bold">{item.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div> : null
                ))}
              </div>
            </CardHeader>
          </Card>
        )}

        {activeTab === "groupQueue" && (
          <Card>
            <CardHeader title="Group Queue" description="Unassigned and pending records in your assignment groups.">
              <div className="mt-4 space-y-2">
                {[
                  { id: "INC001045", title: "VPN access fails after password reset", state: "New", priority: "P1" },
                  { id: "INC001046", title: "Email forwarding not working", state: "New", priority: "P2" },
                  { id: "INC001047", title: "Database connection timeout", state: "In Progress", priority: "P1" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.state === "New" ? "warning" : "info"}>{item.state}</Badge>
                      <span className="text-xs font-bold">{item.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        )}

        {activeTab === "slaRisk" && (
          <Card>
            <CardHeader title="SLA At Risk" description="Records approaching or breaching SLA targets.">
              <div className="mt-4 space-y-2">
                {[
                  { id: "INC001042", title: "VPN access fails after password reset", sla: "15 min remaining", variant: "danger" as const },
                  { id: "INC001039", title: "Finance printer unavailable on level 4", sla: "1 hr remaining", variant: "warning" as const },
                  { id: "INC001050", title: "CRM integration failing", sla: "2 hr remaining", variant: "warning" as const },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.id}</p>
                    </div>
                    <Badge variant={item.variant}>{item.sla}</Badge>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        )}

        {activeTab === "incidents" && (
          <Card>
            <CardHeader title="Major Incidents" description="Active major incidents requiring coordination.">
              <div className="mt-4 space-y-2">
                {majorIncidents.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.id}</p>
                    </div>
                    <Badge variant="danger">{item.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        )}

        {activeTab === "knowledge" && (
          <Card>
            <CardHeader title="Knowledge Suggestions" description="Articles suggested based on your recent activity.">
              <div className="mt-4 space-y-2">
                {knowledgeSuggestions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-cyan-50">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-[10px] text-slate-500">Category: {item.category}</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Recently Viewed" description="Your recently accessed records.">
            <div className="mt-4 space-y-2">
              {[
                { id: "INC001042", title: "VPN access fails after password reset", updated: "8 min ago" },
                { id: "CHG000882", title: "Upgrade customer identity gateway", updated: "1 hr ago" },
                { id: "PRB000401", title: "Recurring authentication latency", updated: "2 hr ago" },
                { id: "REQ002204", title: "New laptop and development software", updated: "43 min ago" },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.id} · {item.updated}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader title="SLA Risk Overview" description="Current SLA health across your work.">
            <div className="mt-4 grid gap-3">
              {[
                { label: "On Track", count: 28, variant: "success" as const },
                { label: "At Risk", count: 5, variant: "warning" as const },
                { label: "Breached", count: 2, variant: "danger" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant={item.variant}>{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
