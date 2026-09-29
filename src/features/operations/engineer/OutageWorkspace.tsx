import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Tabs } from "@shared/components/Tabs";

export function OutageWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Impact", "Communication", "Resolution", "Post-Incident", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="OUT000012 — Outage Record" description="Track service outages and restoration progress." />
      <div className="flex items-center gap-3"><Badge variant="danger">Critical</Badge><Badge variant="warning">Active</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Outage details</div></CardBody></Card>
    </div>
  );
}

export function AvailabilityDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Availability Dashboard" description="Monitor service availability and uptime metrics." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Uptime (30d)", value: "99.97%", variant: "success" as const },
          { label: "MTTR", value: "12 min", variant: "info" as const },
          { label: "MTBF", value: "45 days", variant: "info" as const },
          { label: "Incidents (30d)", value: "3", variant: "warning" as const },
        ].map((stat) => (
          <Card key={stat.label}><CardBody className="p-5"><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p></CardBody></Card>
        ))}
      </div>
      <Card><CardBody><div className="h-64 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">Availability chart would render here</div></CardBody></Card>
    </div>
  );
}
