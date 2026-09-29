import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Server, Plus, Loader2 } from "lucide-react";
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
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface SaaSInstance {
  id: string;
  name: string;
  domain?: string;
  instanceCode?: string;
  instanceStatus: string;
  plan: string;
  userCount: number;
  createdAt: string;
  owner: string;
}

export function InstanceRegistryPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState<SaaSInstance[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = can(permissions, "saas.instance.create");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/instances?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setInstances(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setInstances([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "name", header: "Instance", render: (row: SaaSInstance) => <Link to={`/saas/instances/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.name}</Link> },
    { key: "instanceStatus", header: "Status", render: (row: SaaSInstance) => <Badge variant={row.instanceStatus === "active" ? "success" : row.instanceStatus === "pending" ? "warning" : "muted"}>{row.instanceStatus}</Badge> },
    { key: "plan", header: "Plan", render: (row: SaaSInstance) => <span className="text-slate-600">{row.plan}</span> },
    { key: "userCount", header: "Users", render: (row: SaaSInstance) => <span className="text-slate-900">{row.userCount}</span> },
    { key: "createdAt", header: "Created", render: (row: SaaSInstance) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Instance Registry" description="All SaaS instances and their status." actions={canCreate ? <Link to="/saas/instances/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> New Instance</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading instances…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search instances…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={instances} rowKey={(r) => r.id} loading={loading} emptyDescription="No instances registered." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
