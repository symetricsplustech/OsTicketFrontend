import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";

export function EscalationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Escalations" description="View and manage escalated incidents and problems." actions={<Button>Create Escalation</Button>} />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-2">
        {[
          { id: "ESC001", title: "INC001042 escalated to L3", severity: "High", status: "Active" },
          { id: "ESC002", title: "Database outage escalated to vendor", severity: "Critical", status: "Active" },
        ].map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between"><span className="font-bold text-cyan-700">{item.id}</span><Badge variant={item.severity === "Critical" ? "danger" : "warning"}>{item.severity}</Badge></div>
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <Badge variant={item.status === "Active" ? "danger" : "muted"}>{item.status}</Badge>
          </div>
        ))}
      </div></CardBody></Card>
    </div>
  );
}

export function TeamReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Team Reports" description="Manager reporting and analytics dashboards." actions={<Button>Generate Report</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tickets Resolved", value: "142", trend: "+12", variant: "success" as const },
          { label: "Avg Handle Time", value: "24 min", trend: "-3 min", variant: "info" as const },
          { label: "CSAT", value: "4.6", trend: "+0.2", variant: "success" as const },
          { label: "SLA Compliance", value: "96.2%", trend: "+1.5%", variant: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}><CardBody className="p-5"><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-emerald-600">{stat.trend}</p></CardBody></Card>
        ))}
      </div>
      <Card><CardBody><div className="h-64 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">Team performance chart</div></CardBody></Card>
    </div>
  );
}
