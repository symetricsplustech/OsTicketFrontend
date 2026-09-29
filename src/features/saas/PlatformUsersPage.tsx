import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Plus, Loader2 } from "lucide-react";
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

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  instanceCount: number;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export function PlatformUsersPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = can(permissions, "saas.user.manage");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const columns = [
    { key: "name", header: "User", render: (row: PlatformUser) => <Link to={`/saas/platform-users/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.name}</Link> },
    { key: "email", header: "Email", render: (row: PlatformUser) => <span className="text-slate-600">{row.email}</span> },
    { key: "role", header: "Role", render: (row: PlatformUser) => <Badge variant={row.role === "admin" ? "warning" : row.role === "operator" ? "info" : "muted"}>{row.role}</Badge> },
    { key: "instanceCount", header: "Instances", render: (row: PlatformUser) => <span className="text-slate-900">{row.instanceCount}</span> },
    { key: "status", header: "Status", render: (row: PlatformUser) => <Badge variant={row.status === "active" ? "success" : "muted"}>{row.status}</Badge> },
    { key: "lastLogin", header: "Last Login", render: (row: PlatformUser) => <span className="text-slate-500">{row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Platform Users" description="All platform users and their roles." actions={canManage ? <Link to="/saas/platform-users/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> Add User</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading users…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={users} rowKey={(r) => r.id} loading={loading} emptyDescription="No platform users found." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
