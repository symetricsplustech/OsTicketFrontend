import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Tabs } from "@shared/components/Tabs";
import { useAppSelector } from "@shared/store/hooks";

export function ProblemWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Related incidents", "Investigation", "Root cause", "Workaround", "Known error", "Changes", "Tasks", "Attachments", "Activity", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="PRB000401 — Problem Workspace" description="Problem record with investigation details and related incidents." />
      <div className="flex items-center gap-3"><Badge variant="warning">Root Cause</Badge><Badge variant="danger">P1</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} content</div></CardBody></Card>
    </div>
  );
}

export function ChangeList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const changes = [
    { id: "1", number: "CHG000882", title: "Upgrade customer identity gateway", type: "Normal", state: "Scheduled", risk: "Medium", owner: "Kabir Rao", start: "2024-02-01", end: "2024-02-02" },
    { id: "2", number: "CHG000890", title: "Quarterly security patch deployment", type: "Standard", state: "Scheduled", risk: "Low", owner: "Team", start: "2024-02-10", end: "2024-02-10" },
  ];

  const filtered = changes.filter((c) => {
    const matchSearch = `${c.number} ${c.title} ${c.owner}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.state.toLowerCase().includes(statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: "number", header: "Number", render: (row: typeof changes[0]) => <span className="font-bold text-cyan-700">{row.number}</span> },
    { key: "title", header: "Short description", render: (row: typeof changes[0]) => <span className="font-medium">{row.title}</span> },
    { key: "type", header: "Type", render: (row: typeof changes[0]) => <Badge variant="info">{row.type}</Badge> },
    { key: "state", header: "State", render: (row: typeof changes[0]) => <Badge variant={row.state === "Scheduled" ? "warning" : "success"}>{row.state}</Badge> },
    { key: "risk", header: "Risk", render: (row: typeof changes[0]) => <Badge variant={row.risk === "High" ? "danger" : row.risk === "Medium" ? "warning" : "success"}>{row.risk}</Badge> },
    { key: "owner", header: "Owner", render: (row: typeof changes[0]) => <span>{row.owner}</span> },
    { key: "start", header: "Planned Start", render: (row: typeof changes[0]) => <span>{row.start}</span> },
    { key: "end", header: "Planned End", render: (row: typeof changes[0]) => <span>{row.end}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Change List" description="Manage and track change records, approvals, and scheduled windows." actions={<Button>Create Change</Button>} />
      <Card>
        <CardHeader title="Changes" actions={<div className="relative"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search changes…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0">
          <div className="flex gap-1 border-b px-4">
            {["All", "Scheduled", "In Progress", "Completed", "Rejected"].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`border-b-2 px-3 py-2 text-xs font-semibold ${statusFilter === s ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500"}`}>{s}</button>
            ))}
          </div>
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No changes found" />
          <Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} />
        </CardBody>
      </Card>
    </div>
  );
}

export function ChangeWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Risk", "Plan", "Schedule", "Approvals / CAB", "Tasks", "Affected CIs / services", "Conflicts", "Implementation", "Validation", "PIR", "Attachments", "Activity", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="CHG000882 — Change Workspace" description="Change record with risk assessment, plan, and approval workflows." />
      <div className="flex items-center gap-3"><Badge variant="warning">Scheduled</Badge><Badge variant="info">Normal</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} content</div></CardBody></Card>
    </div>
  );
}

export function ChangeCalendar() {
  return (
    <div className="space-y-6">
      <PageHeader title="Change Calendar" description="View and manage scheduled changes on a calendar timeline." actions={<Button>Add Event</Button>} />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Security Patch", date: "Feb 1", type: "Standard", status: "Scheduled" },
          { title: "DB Migration", date: "Feb 10", type: "Normal", status: "Scheduled" },
          { title: "Server Upgrade", date: "Feb 15", type: "Emergency", status: "In Progress" },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between"><Badge variant="info">{item.type}</Badge><Badge variant={item.status === "Scheduled" ? "warning" : "info"}>{item.status}</Badge></div>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{item.date}</p>
          </div>
        ))}
      </div></CardBody></Card>
    </div>
  );
}
