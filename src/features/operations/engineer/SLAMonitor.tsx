import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { SlaPanel } from "@shared/components/SlaPanel";
import { DataTable } from "@shared/components/DataTable";
import { useAppSelector } from "@shared/store/hooks";

interface SlaRecord {
  id: string; number: string; title: string; responseTarget: string; resolutionTarget: string; status: string; breached: boolean; warning: boolean;
}

const slaRecords: SlaRecord[] = [
  { id: "1", number: "INC001042", title: "VPN access fails after password reset", responseTarget: "15m", resolutionTarget: "4h", status: "On Track", breached: false, warning: false },
  { id: "2", number: "INC001039", title: "Finance printer unavailable", responseTarget: "1h", resolutionTarget: "8h", status: "At Risk", breached: false, warning: true },
  { id: "3", number: "INC001045", title: "Database connection timeout", responseTarget: "5m", resolutionTarget: "1h", status: "Breached", breached: true, warning: true },
];

export function SLAMonitor() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "On Track", "At Risk", "Breached"];

  const filtered = activeTab === "All" ? slaRecords : slaRecords.filter((r) => r.status === activeTab);

  const columns = [
    { key: "number", header: "Number", render: (row: SlaRecord) => <span className="font-bold text-cyan-700">{row.number}</span> },
    { key: "title", header: "Record", render: (row: SlaRecord) => <span className="font-medium">{row.title}</span> },
    { key: "responseTarget", header: "Response SLA", render: (row: SlaRecord) => <span>{row.responseTarget}</span> },
    { key: "resolutionTarget", header: "Resolution SLA", render: (row: SlaRecord) => <span>{row.resolutionTarget}</span> },
    { key: "status", header: "Status", render: (row: SlaRecord) => <Badge variant={row.breached ? "danger" : row.warning ? "warning" : "success"}>{row.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="SLA Monitor" description="Monitor SLA performance across all active records." actions={<Button>Export Report</Button>} />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-800">On Track</p><p className="mt-1 text-2xl font-bold text-emerald-700">{slaRecords.filter((r) => !r.breached && !r.warning).length}</p></div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-800">At Risk</p><p className="mt-1 text-2xl font-bold text-amber-700">{slaRecords.filter((r) => r.warning).length}</p></div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4"><p className="text-sm font-semibold text-red-800">Breached</p><p className="mt-1 text-2xl font-bold text-red-700">{slaRecords.filter((r) => r.breached).length}</p></div>
      </div></CardBody></Card>
      <Card>
        <CardHeader title="SLA Records" actions={<div className="flex gap-1">{tabs.map((t) => <button key={t} onClick={() => setActiveTab(t)} className={`rounded px-2 py-1 text-xs font-semibold ${activeTab === t ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>{t}</button>)}</div>} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No SLA records found" /></CardBody>
      </Card>
    </div>
  );
}
