import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { StatusBadge } from "@shared/components/Badge";
import { Search } from "lucide-react";

interface ProblemRecord {
  id: string; number: string; title: string; state: string; priority: string; owner: string; relatedIncidents: string; knownError: string; updated: string;
}

const problems: ProblemRecord[] = [
  { id: "1", number: "PRB000401", title: "Recurring authentication latency", state: "Root Cause", priority: "P1", owner: "Riya Verma", relatedIncidents: "3", knownError: "Yes", updated: "2 hr ago" },
  { id: "2", number: "PRB000398", title: "Memory leak in auth service", state: "Assess", priority: "P2", owner: "Kabir Rao", relatedIncidents: "1", knownError: "No", updated: "1 day ago" },
];

export function ProblemList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = problems.filter((p) => {
    const matchSearch = `${p.number} ${p.title} ${p.owner}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.state.toLowerCase().includes(statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: "number", header: "Number", render: (row: ProblemRecord) => <button onClick={() => navigate(`/instances/1/workspace/problems/${row.id}`)} className="font-bold text-cyan-700 hover:underline">{row.number}</button> },
    { key: "title", header: "Short description", render: (row: ProblemRecord) => <span className="font-medium">{row.title}</span> },
    { key: "state", header: "State", render: (row: ProblemRecord) => <StatusBadge status={row.state} /> },
    { key: "priority", header: "Priority", render: (row: ProblemRecord) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "owner", header: "Owner", render: (row: ProblemRecord) => <span>{row.owner}</span> },
    { key: "relatedIncidents", header: "Related Incidents", render: (row: ProblemRecord) => <span>{row.relatedIncidents}</span> },
    { key: "updated", header: "Updated", render: (row: ProblemRecord) => <span className="text-slate-500">{row.updated}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Problem List" description="Manage and track problem records, root causes, and known errors." actions={<Button>Create Problem</Button>} />
      <Card>
        <CardHeader title="Problems" actions={<div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search problems…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No problems found" />
          <Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} />
        </CardBody>
      </Card>
    </div>
  );
}

export function ProblemWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Related incidents", "Investigation", "Root cause", "Workaround", "Known error", "Changes", "Tasks", "Attachments", "Activity", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="PRB000401 — Problem Workspace" description="Problem record with investigation details and related incidents." actions={<Button>Update</Button>} />
      <div className="flex items-center gap-3"><Badge variant="warning">Root Cause</Badge><Badge variant="danger">P1</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody>
        {activeTab === "Overview" && <div className="py-8 text-center text-sm text-slate-500">Problem overview and details</div>}
        {activeTab === "Related incidents" && <div className="py-8 text-center text-sm text-slate-500">3 related incidents found</div>}
        {activeTab === "Activity" && <div className="py-8 text-center text-sm text-slate-500">No activity recorded</div>}
        {activeTab === "Audit" && <div className="py-8 text-center text-sm text-slate-500">No audit entries</div>}
      </CardBody></Card>
    </div>
  );
}
