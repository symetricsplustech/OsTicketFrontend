import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { EntityListPage } from "@shared/page-shells/EntityListPage";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";

interface RequestRow {
  id: string;
  number: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
}

export function MyRequests() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/requests?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
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
    { key: "number", header: "Number", render: (row: RequestRow) => <Link to={`requests/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.number}</Link> },
    { key: "title", header: "Title", render: (row: RequestRow) => <span className="text-slate-900">{row.title}</span> },
    { key: "category", header: "Category", render: (row: RequestRow) => <span className="text-slate-600">{row.category}</span> },
    { key: "priority", header: "Priority", render: (row: RequestRow) => <Badge variant={row.priority === "critical" ? "danger" : row.priority === "high" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "status", header: "Status", render: (row: RequestRow) => <Badge variant={row.status === "open" ? "warning" : row.status === "resolved" ? "success" : "muted"}>{row.status}</Badge> },
    { key: "createdAt", header: "Created", render: (row: RequestRow) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="My Requests" description="Requests you have submitted." actions={<Link to={`/instances/${useParams()?.instanceId}/portal/catalog`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Request Service</Link>} />
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading requests…</span></div>
      ) : (
        <EntityListPage title="My Requests" searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} columns={columns} rows={rows} rowKey={(r) => r.id} page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} loading={loading} emptyDescription="No requests found." />
      )}
    </div>
  );
}

import { useParams } from "react-router-dom";
