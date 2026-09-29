import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { Search } from "lucide-react";

interface FieldJob {
  id: string; number: string; title: string; customer: string; site: string; status: string; priority: string; updated: string;
}

const fieldJobs: FieldJob[] = [
  { id: "1", number: "FJ00001", title: "Printer replacement at office", customer: "Acme Corp", site: "123 Main St", status: "Scheduled", priority: "P2", updated: "2024-01-15" },
  { id: "2", number: "FJ00002", title: "Network cable installation", customer: "TechStart Inc", site: "456 Tech Ave", status: "In Progress", priority: "P1", updated: "2024-01-15" },
  { id: "3", number: "FJ00003", title: "Server rack maintenance", customer: "DataCo", site: "789 Data Blvd", status: "Completed", priority: "P3", updated: "2024-01-14" },
];

export function FieldJobs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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
      <PageHeader title="Field Jobs" description="View and manage your assigned field jobs." actions={<Button>Refresh</Button>} />
      <Card>
        <CardHeader title="Field Jobs" actions={<div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search jobs…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0"><DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No field jobs found" /><Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} /></CardBody>
      </Card>
    </div>
  );
}
