import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { FieldJob } from "@shared/components";

interface FieldJob {
  id: string; number: string; title: string; customer: string; site: string; status: string; priority: string; updated: string;
}

const fieldJobs: FieldJob[] = [
  { id: "1", number: "FJ00001", title: "Printer replacement at office", customer: "Acme Corp", site: "123 Main St", status: "Scheduled", priority: "P2", updated: "2024-01-15" },
  { id: "2", number: "FJ00002", title: "Network cable installation", customer: "TechStart Inc", site: "456 Tech Ave", status: "In Progress", priority: "P1", updated: "2024-01-15" },
  { id: "3", number: "FJ00003", title: "Server rack maintenance", customer: "DataCo", site: "789 Data Blvd", status: "Completed", priority: "P3", updated: "2024-01-14" },
];

export function FieldHome() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Day" description="Your field service schedule for today." actions={<Button>Check In</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Scheduled", value: 4, variant: "info" as const },
          { label: "In Progress", value: 2, variant: "warning" as const },
          { label: "Completed", value: 8, variant: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}><CardBody className="p-5"><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p></CardBody></Card>
        ))}
      </div>
      <Card><CardBody><div className="space-y-3">
        {fieldJobs.filter((j) => j.status !== "Completed").map((job) => (
          <div key={job.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div><p className="font-semibold">{job.title}</p><p className="text-xs text-slate-500">{job.number} · {job.customer}</p></div>
            <Badge variant={job.status === "In Progress" ? "warning" : "info"}>{job.status}</Badge>
          </div>
        ))}
      </div></CardBody></Card>
    </div>
  );
}

export function FieldJobs() {
  const [search, setSearch] = useState("");

  const filtered = fieldJobs.filter((j) => `${j.title} ${j.customer}`.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "number", header: "Job ID", render: (row: FieldJob) => <span className="font-bold text-cyan-700">{row.number}</span> },
    { key: "title", header: "Title", render: (row: FieldJob) => <span className="font-medium">{row.title}</span> },
    { key: "customer", header: "Customer", render: (row: FieldJob) => <span>{row.customer}</span> },
    { key: "site", header: "Site", render: (row: FieldJob) => <span>{row.site}</span> },
    { key: "status", header: "Status", render: (row: FieldJob) => <Badge variant={row.status === "In Progress" ? "warning" : row.status === "Completed" ? "success" : "info"}>{row.status}</Badge> },
    { key: "priority", header: "Priority", render: (row: FieldJob) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Field Jobs" description="View and manage your assigned field jobs." />
      <Card>
        <CardHeader title="Jobs" actions={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" />} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No field jobs found" /></CardBody>
      </Card>
    </div>
  );
}

export function FieldJobDetail() {
  const tabs = ["Overview", "Customer", "Work Log", "Parts", "Time", "Signature", "Complete", "Audit"];
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-5">
      <PageHeader title="FJ00002 — Field Job Detail" description="Job details, customer info, and work log." />
      <div className="flex items-center gap-3"><Badge variant="warning">In Progress</Badge><Badge variant="info">P1</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Job detail</div></CardBody></Card>
    </div>
  );
}

export function FieldAvailability() {
  return (
    <div className="space-y-6">
      <PageHeader title="Field Availability" description="Manage your availability and schedule." />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { day: "Monday", status: "Available", slots: "8:00 - 17:00" },
          { day: "Tuesday", status: "On-Site", slots: "08:00 - 16:00" },
          { day: "Wednesday", status: "Available", slots: "8:00 - 17:00" },
        ].map((item) => (
          <Card key={item.day}><CardBody className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">{item.day}</h3><Badge variant={item.status === "Available" ? "success" : "info"}>{item.status}</Badge></div><p className="mt-2 text-sm text-slate-500">{item.slots}</p></CardBody></Card>
        ))}
      </div>
    </div>
  );
}
