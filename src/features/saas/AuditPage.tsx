import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, Filter, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Input } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Pagination } from "@shared/components/Pagination";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";
import { DataTable } from "@shared/components/DataTable";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: string;
  ip?: string;
  correlationId?: string;
}

export function AuditPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ actor: "", action: "", resourceType: "" });

  const canRead = can(permissions, "saas.audit.read");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20", search });
        if (filters.actor) params.set("actor", filters.actor);
        if (filters.action) params.set("action", filters.action);
        if (filters.resourceType) params.set("resourceType", filters.resourceType);
        const res = await fetch(`/api/v1/saas/audit?${params}`);
        const data = await res.json();
        if (data.success) {
          setEntries(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, filters]);

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (row: AuditEntry) => <span className="text-slate-500">{new Date(row.timestamp).toLocaleString()}</span> },
    { key: "actor", header: "Actor", render: (row: AuditEntry) => <span className="font-medium">{row.actor}</span> },
    { key: "action", header: "Action", render: (row: AuditEntry) => <span className="text-slate-900">{row.action}</span> },
    { key: "resourceType", header: "Resource", render: (row: AuditEntry) => <span className="text-slate-600">{row.resourceType} #{row.resourceId}</span> },
    { key: "outcome", header: "Outcome", render: (row: AuditEntry) => <Badge variant={row.outcome === "success" ? "success" : row.outcome === "failure" ? "danger" : "info"}>{row.outcome}</Badge> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Audit Explorer" description="Platform audit trail and event logs." />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading audit entries…</span></div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <AuditExplorer
                entries={entries}
                loading={loading}
                onFilter={(newFilters) => { setFilters(newFilters); setPage(1); }}
              />
            </CardBody>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search audit entries…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
              </div>
              <Filter className="h-4 w-4 text-slate-400" />
              <select value={filters.actor} onChange={(e) => { setFilters((prev) => ({ ...prev, actor: e.target.value })); setPage(1); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">All Actors</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="system">System</option>
              </select>
            </div>
            <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} loading={loading} emptyDescription="No audit entries found." />
            <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
          </Card>
        </div>
      )}
    </div>
  );
}

import { Badge } from "@shared/components/Badge";
