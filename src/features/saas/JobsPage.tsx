import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Activity, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Input } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { QueueWorkspacePage } from "@shared/page-shells/ConfigurationListPage";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface JobEntry {
  id: string;
  queue: string;
  jobName: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export function JobsPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = can(permissions, "saas.job.manage");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/jobs?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setJobs(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "jobName", header: "Job", render: (row: JobEntry) => <span className="font-medium">{row.jobName}</span> },
    { key: "queue", header: "Queue", render: (row: JobEntry) => <Badge variant="info">{row.queue}</Badge> },
    { key: "status", header: "Status", render: (row: JobEntry) => <Badge variant={row.status === "completed" ? "success" : row.status === "failed" ? "danger" : row.status === "running" ? "warning" : "muted"}>{row.status}</Badge> },
    { key: "attempts", header: "Attempts", render: (row: JobEntry) => <span className={row.attempts >= row.maxAttempts ? "text-red-600 font-medium" : "text-slate-900"}>{row.attempts}/{row.maxAttempts}</span> },
    { key: "createdAt", header: "Created", render: (row: JobEntry) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Jobs & Queues" description="Manage background jobs and queue workers." actions={canManage ? <Link to="/saas/jobs/workers" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Activity className="h-4 w-4" /> Workers</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading jobs…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search jobs…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={jobs} rowKey={(r) => r.id} loading={loading} emptyDescription="No jobs found." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
