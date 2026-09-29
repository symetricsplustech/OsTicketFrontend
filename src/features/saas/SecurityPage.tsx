import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Shield, Lock, UserShield, Key, AlertTriangle, Loader2 } from "lucide-react";
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

interface SecurityItem {
  id: string;
  type: string;
  description: string;
  status: string;
  severity: string;
  lastChecked: string;
  affectedUsers: number;
}

export function SecurityPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SecurityItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = can(permissions, "saas.security.manage");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/security?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setItems(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "type", header: "Type", render: (row: SecurityItem) => <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-400" /><span className="font-medium">{row.type}</span></div> },
    { key: "description", header: "Description", render: (row: SecurityItem) => <span className="text-slate-600">{row.description}</span> },
    { key: "severity", header: "Severity", render: (row: SecurityItem) => <Badge variant={row.severity === "critical" ? "danger" : row.severity === "high" ? "warning" : "info"}>{row.severity}</Badge> },
    { key: "status", header: "Status", render: (row: SecurityItem) => <Badge variant={row.status === "resolved" ? "success" : row.status === "active" ? "warning" : "muted"}>{row.status}</Badge> },
    { key: "affectedUsers", header: "Users", render: (row: SecurityItem) => <span className="text-slate-900">{row.affectedUsers}</span> },
    { key: "lastChecked", header: "Last Checked", render: (row: SecurityItem) => <span className="text-slate-500">{new Date(row.lastChecked).toLocaleDateString()}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Platform Security" description="Security posture, vulnerabilities, and access controls." actions={canManage ? <Link to="/saas/security/report" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Shield className="h-4 w-4" /> Run Scan</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading security data…</span></div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardBody className="text-center"><Shield className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-2 text-2xl font-bold">99.9%</p><p className="text-xs text-slate-500">Compliance Score</p></CardBody></Card>
            <Card><CardBody className="text-center"><UserShield className="mx-auto h-8 w-8 text-brand-500" /><p className="mt-2 text-2xl font-bold">24</p><p className="text-xs text-slate-500">Active Sessions</p></CardBody></Card>
            <Card><CardBody className="text-center"><AlertTriangle className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 text-2xl font-bold">3</p><p className="text-xs text-slate-500">Open Issues</p></CardBody></Card>
          </div>

          <Card>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search security items…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
              </div>
            </div>
            <DataTable columns={columns} rows={items} rowKey={(r) => r.id} loading={loading} emptyDescription="No security items found." />
            <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
          </Card>
        </div>
      )}
    </div>
  );
}
