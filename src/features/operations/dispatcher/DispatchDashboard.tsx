import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { KanbanBoard } from "@shared/components";
import { Search } from "lucide-react";

interface DispatchCard {
  id: string; number: string; title: string; state: string; priority: string; assignedTo: string; column: string;
}

const dispatchCards: DispatchCard[] = [
  { id: "1", number: "INC001045", title: "Database connection timeout", state: "Unassigned", priority: "P1", assignedTo: "—", column: "unassigned" },
  { id: "2", number: "INC001039", title: "Finance printer unavailable", state: "Assigned", priority: "P3", assignedTo: "Neha Singh", column: "assigned" },
  { id: "3", number: "INC001030", title: "Network connectivity restored", state: "Resolved", priority: "P2", assignedTo: "Aarav Mehta", column: "resolved" },
];

const columns = [
  { key: "number", header: "Number", render: (row: DispatchCard) => <span className="font-bold text-cyan-700">{row.number}</span> },
  { key: "title", header: "Title", render: (row: DispatchCard) => <span className="font-medium">{row.title}</span> },
  { key: "state", header: "State", render: (row: DispatchCard) => <Badge variant={row.state === "Unassigned" ? "warning" : row.state === "Resolved" ? "success" : "info"}>{row.state}</Badge> },
  { key: "priority", header: "Priority", render: (row: DispatchCard) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
  { key: "assignedTo", header: "Assigned To", render: (row: DispatchCard) => <span>{row.assignedTo}</span> },
];

export function DispatchDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dispatcher Dashboard" description="Dispatch overview, unassigned queues, and SLA risks." actions={<Button>Refresh</Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Unassigned", value: 12, variant: "warning" as const },
          { label: "SLA Breached", value: 3, variant: "danger" as const },
          { label: "Today's Schedule", value: 28, variant: "info" as const },
          { label: "Pending Reassign", value: 5, variant: "muted" as const },
        ].map((stat) => (
          <Card key={stat.label}><CardBody className="p-5"><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p></CardBody></Card>
        ))}
      </div>
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">Dispatch activity feed</div></CardBody></Card>
    </div>
  );
}

export function DispatchBoard() {
  const [activeColumn, setActiveColumn] = useState("all");
  const columns = ["unassigned", "assigned", "in-progress", "resolved"];

  return (
    <div className="space-y-6">
      <PageHeader title="Dispatch Board" description="Kanban board for dispatching records across assignment groups." actions={<Button>Filter</Button>} />
      <div className="flex gap-1">
        {["All", "Unassigned", "Assigned", "In Progress", "Resolved"].map((col) => (
          <button key={col} onClick={() => setActiveColumn(col.toLowerCase())} className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeColumn === col.toLowerCase() ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>{col}</button>
        ))}
      </div>
      <Card>
        <CardHeader title="Dispatch Queue" actions={<Search className="h-4 w-4 text-slate-400" />} />
        <CardBody className="p-0"><DataTable columns={columns} rows={dispatchCards} rowKey={(r) => r.id} loading={false} emptyTitle="No dispatch items" /></CardBody>
      </Card>
    </div>
  );
}

export function EngineerDirectory() {
  const [search, setSearch] = useState("");

  const engineers = [
    { id: "1", name: "Aarav Mehta", group: "Service Desk L2", skills: ["Network", "VPN"], availability: "Available" },
    { id: "2", name: "Neha Singh", group: "Service Desk L1", skills: ["Hardware", "Printer"], availability: "Busy" },
    { id: "3", name: "Kabir Rao", group: "Security", skills: ["IAM", "Security"], availability: "Available" },
  ];

  const filtered = engineers.filter((e) => `${e.name} ${e.group}`.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "name", header: "Engineer", render: (row: typeof engineers[0]) => <span className="font-semibold">{row.name}</span> },
    { key: "group", header: "Group", render: (row: typeof engineers[0]) => <span>{row.group}</span> },
    { key: "skills", header: "Skills", render: (row: typeof engineers[0]) => <span>{row.skills.join(", ")}</span> },
    { key: "availability", header: "Availability", render: (row: typeof engineers[0]) => <Badge variant={row.availability === "Available" ? "success" : "warning"}>{row.availability}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Engineer Directory" description="Find and assign engineers by skills, group, and availability." actions={<Button>Refresh</Button>} />
      <Card>
        <CardHeader title="Engineers" actions={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search engineers…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" />} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No engineers found" /></CardBody>
      </Card>
    </div>
  );
}

export function SchedulePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dispatch Schedule" description="View and manage the dispatch schedule and on-call rotations." />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-3">
        {[
          { day: "Monday", onCall: "Aarav Mehta", backup: "Neha Singh" },
          { day: "Tuesday", onCall: "Neha Singh", backup: "Kabir Rao" },
          { day: "Wednesday", onCall: "Kabir Rao", backup: "Aarav Mehta" },
        ].map((shift, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">{shift.day}</h3>
            <p className="mt-2 text-sm">On-Call: <span className="font-medium">{shift.onCall}</span></p>
            <p className="text-sm">Backup: <span className="font-medium">{shift.backup}</span></p>
          </div>
        ))}
      </div></CardBody></Card>
    </div>
  );
}
