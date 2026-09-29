import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { Search } from "lucide-react";

interface QueueItem {
  id: string; number: string; title: string; state: string; priority: string; assignedTo: string; group: string; sla: string; updated: string;
}

const queueItems: QueueItem[] = [
  { id: "1", number: "INC001042", title: "VPN access fails after password reset", state: "In Progress", priority: "P1", assignedTo: "Aarav Mehta", group: "Service Desk L2", sla: "15m", updated: "8 min ago" },
  { id: "2", number: "INC001045", title: "Database connection timeout", state: "New", priority: "P1", assignedTo: "—", group: "Unassigned", sla: "5m", updated: "3 min ago" },
  { id: "3", number: "INC001039", title: "Finance printer unavailable", state: "Assigned", priority: "P3", assignedTo: "Neha Singh", group: "Service Desk L1", sla: "1h", updated: "21 min ago" },
];

export function TeamQueue() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const tabs = ["All", "Unassigned", "High Priority", "SLA At Risk", "Escalated"];

  const filtered = queueItems.filter((q) => {
    const matchSearch = `${q.number} ${q.title} ${q.assignedTo}`.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" || activeTab === "Unassigned" ? true : true;
    return matchSearch && matchTab;
  });

  const columns = [
    { key: "number", header: "Number", render: (row: QueueItem) => <span className="font-bold text-cyan-700">{row.number}</span> },
    { key: "title", header: "Title", render: (row: QueueItem) => <span className="font-medium">{row.title}</span> },
    { key: "state", header: "State", render: (row: QueueItem) => <Badge variant={row.state === "New" ? "warning" : row.state === "In Progress" ? "info" : "success"}>{row.state}</Badge> },
    { key: "priority", header: "Priority", render: (row: QueueItem) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "assignedTo", header: "Assigned To", render: (row: QueueItem) => <span>{row.assignedTo}</span> },
    { key: "group", header: "Group", render: (row: QueueItem) => <span>{row.group}</span> },
    { key: "sla", header: "SLA", render: (row: QueueItem) => <Badge variant={row.sla === "5m" ? "danger" : row.sla === "15m" ? "warning" : "success"}>{row.sla}</Badge> },
    { key: "updated", header: "Updated", render: (row: QueueItem) => <span>{row.updated}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Team Queue" description="View and manage team work queues." actions={<Button>Bulk Assign</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card>
        <CardHeader title={`Queue — ${activeTab}`} actions={<div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search queue…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No queue items" /><Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} /></CardBody>
      </Card>
    </div>
  );
}
