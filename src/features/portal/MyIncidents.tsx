import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";

interface IncidentRow {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

export function MyIncidents() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<IncidentRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/incidents?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setRows(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "number", header: "Number", render: (row: IncidentRow) => <Link to={`incidents/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.number}</Link> },
    { key: "title", header: "Title", render: (row: IncidentRow) => <span className="text-slate-900">{row.title}</span> },
    { key: "priority", header: "Priority", render: (row: IncidentRow) => <Badge variant={row.priority === "critical" ? "danger" : row.priority === "high" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "status", header: "Status", render: (row: IncidentRow) => <Badge variant={row.status === "open" ? "warning" : row.status === "resolved" ? "success" : "muted"}>{row.status}</Badge> },
    { key: "createdAt", header: "Created", render: (row: IncidentRow) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="My Incidents" description="Incidents you have reported." />
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading incidents…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-md">
              <Link to={`/instances/${useParams()?.instanceId}/portal/help`} className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"><AlertTriangle className="h-4 w-4" /></Link>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search incidents…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} emptyDescription="No incidents found." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}

import { useParams } from "react-router-dom";
