import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { DataTable } from "@shared/components/DataTable";
import { Search } from "lucide-react";

interface CI {
  id: string; name: string; type: string; status: string; service: string; updated: string;
}

const cis: CI[] = [
  { id: "1", name: "VPN-Gateway", type: "Network", status: "Active", service: "VPN", updated: "2024-01-15" },
  { id: "2", name: "PG-Primary", type: "Database", status: "Active", service: "Core Services", updated: "2024-01-14" },
  { id: "3", name: "HP-LaserJet", type: "Hardware", status: "Inactive", service: "Print", updated: "2024-01-10" },
];

export function CMDBWorkspace() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = cis.filter((c) => `${c.name} ${c.type}`.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "name", header: "Name", render: (row: CI) => <span className="font-bold text-cyan-700">{row.name}</span> },
    { key: "type", header: "Type", render: (row: CI) => <Badge variant="info">{row.type}</Badge> },
    { key: "status", header: "Status", render: (row: CI) => <Badge variant={row.status === "Active" ? "success" : "warning"}>{row.status}</Badge> },
    { key: "service", header: "Service", render: (row: CI) => <span>{row.service}</span> },
    { key: "updated", header: "Updated", render: (row: CI) => <span>{row.updated}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Configuration Items" description="Browse and manage CMDB records." actions={<Button>Add CI</Button>} />
      <Card>
        <CardHeader title="CIs" actions={<div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search CIs…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No CIs found" /></CardBody>
      </Card>
    </div>
  );
}

export function CIWorkspace() {
  const tabs = ["Attributes", "Relationships", "Incidents", "Problems", "Changes", "Outages", "Audit"];
  const [activeTab, setActiveTab] = useState("Attributes");

  return (
    <div className="space-y-5">
      <PageHeader title="VPN-Gateway — CI Record" description="Configuration item details and relationships." />
      <div className="flex items-center gap-3"><Badge variant="success">Active</Badge><Badge variant="info">Network</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — CI details</div></CardBody></Card>
    </div>
  );
}

export function ServiceWorkspace() {
  const tabs = ["Overview", "CIs", "Incidents", "Problems", "Changes", "SLA", "Audit"];
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-5">
      <PageHeader title="Workplace Technology — Service Record" description="Business service details and health." />
      <div className="flex items-center gap-3"><Badge variant="success">Active</Badge><Badge variant="info">42 CIs</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Service details</div></CardBody></Card>
    </div>
  );
}
