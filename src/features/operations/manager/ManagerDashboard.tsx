import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { DashboardPage } from "@page-shells/DashboardPage";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { useAppSelector } from "@shared/store/hooks";

interface EngineerWorkload {
  id: string; name: string; team: string; activeJobs: number; scheduled: number; slaRisk: number; status: string;
}

const engineers: EngineerWorkload[] = [
  { id: "1", name: "Aarav Mehta", team: "Service Desk L2", activeJobs: 3, scheduled: 2, slaRisk: 2, status: "Available" },
  { id: "2", name: "Neha Singh", team: "Service Desk L1", activeJobs: 5, scheduled: 3, slaRisk: 4, status: "Busy" },
  { id: "3", name: "Kabir Rao", team: "Security", activeJobs: 2, scheduled: 1, slaRisk: 1, status: "Available" },
];

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Workload", "Queues", "SLA Risk", "Reports"];

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" description="Team overview, workloads, and operational metrics." actions={<Button>Export Report</Button>} />
      <DashboardPage
        title="Team Overview"
        kpiCounts={[
          { label: "Active Incidents", value: 47, trend: "up", trendValue: "+5" },
          { label: "SLA Breach Rate", value: "2.1%", trend: "down", trendValue: "-0.8%" },
          { label: "Avg Response Time", value: "8 min", trend: "down", trendValue: "-2 min" },
          { label: "Pending Approvals", value: 12, trend: "up", trendValue: "+3" },
        ]}
        loading={false}
      />
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card>
        <CardHeader title="Engineer Workload" actions={<div className="relative"><input placeholder="Search engineers…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0">
          <DataTable columns={[
            { key: "name", header: "Engineer", render: (row: EngineerWorkload) => <span className="font-semibold">{row.name}</span> },
            { key: "team", header: "Team", render: (row: EngineerWorkload) => <span>{row.team}</span> },
            { key: "activeJobs", header: "Active Jobs", render: (row: EngineerWorkload) => <span>{row.activeJobs}</span> },
            { key: "scheduled", header: "Scheduled", render: (row: EngineerWorkload) => <span>{row.scheduled}</span> },
            { key: "slaRisk", header: "SLA Risk", render: (row: EngineerWorkload) => <Badge variant={row.slaRisk > 3 ? "danger" : row.slaRisk > 2 ? "warning" : "success"}>{row.slaRisk}</Badge> },
            { key: "status", header: "Status", render: (row: EngineerWorkload) => <Badge variant={row.status === "Available" ? "success" : "warning"}>{row.status}</Badge> },
          ]} rows={engineers} rowKey={(r) => r.id} loading={false} emptyTitle="No engineers found" />
        </CardBody>
      </Card>
    </div>
  );
}

export function TeamQueue() {
  const [activeTab, setActiveTab] = useState("Assigned");
  const tabs = ["Assigned", "Unassigned", "Escalated", "Scheduled", "Completed"];

  return (
    <div className="space-y-6">
      <PageHeader title="Team Queue" description="Manage and prioritize team work queues." actions={<Button>Assign</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Team queue content</div></CardBody></Card>
    </div>
  );
}

export function EscalationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Escalations" description="View and manage escalated incidents and problems." actions={<Button>Create Escalation</Button>} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">No active escalations</div></CardBody></Card>
    </div>
  );
}

export function TeamReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Team Reports" description="Manager reporting and analytics." actions={<Button>Generate Report</Button>} />
      <DashboardPage title="Reports" kpiCounts={[
        { label: "Tickets Resolved", value: 142, trend: "up", trendValue: "+12" },
        { label: "Avg Handle Time", value: "24 min", trend: "down", trendValue: "-3 min" },
        { label: "CSAT", value: "4.6", trend: "up", trendValue: "+0.2" },
        { label: "SLA Compliance", value: "96.2%", trend: "up", trendValue: "+1.5%" },
      ]} loading={false} />
    </div>
  );
}
