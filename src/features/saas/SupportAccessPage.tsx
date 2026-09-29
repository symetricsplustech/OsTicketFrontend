import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, Key, Clock, Loader2 } from "lucide-react";
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

interface SupportAccess {
  id: string;
  userName: string;
  userId: string;
  accessLevel: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  status: string;
  reason: string;
}

export function SupportAccessPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accessEntries, setAccessEntries] = useState<SupportAccess[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = can(permissions, "saas.support.manage");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/support-access?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setAccessEntries(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setAccessEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "userName", header: "User", render: (row: SupportAccess) => <span className="font-medium">{row.userName}</span> },
    { key: "accessLevel", header: "Access Level", render: (row: SupportAccess) => <Badge variant={row.accessLevel === "admin" ? "danger" : row.accessLevel === "read" ? "info" : "warning"}>{row.accessLevel}</Badge> },
    { key: "grantedBy", header: "Granted By", render: (row: SupportAccess) => <span className="text-slate-600">{row.grantedBy}</span> },
    { key: "status", header: "Status", render: (row: SupportAccess) => <Badge variant={row.status === "active" ? "success" : row.status === "expired" ? "muted" : "warning"}>{row.status}</Badge> },
    { key: "grantedAt", header: "Granted", render: (row: SupportAccess) => <span className="text-slate-500">{new Date(row.grantedAt).toLocaleDateString()}</span> },
    { key: "expiresAt", header: "Expires", render: (row: SupportAccess) => <span className="text-slate-500">{row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Support Access" description="Manage support-level access to platform instances." actions={canManage ? <Link to="/saas/support-access/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Key className="h-4 w-4" /> Grant Access</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading support access…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search access entries…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={accessEntries} rowKey={(r) => r.id} loading={loading} emptyDescription="No support access entries found." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
