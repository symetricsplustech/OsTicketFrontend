import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Settings, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
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

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export function FeaturesPage() {
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = can(permissions, "saas.feature.manage");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/saas/features?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setFeatures(data.items ?? []);
          setTotalItems(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const toggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/saas/features/${id}/toggle`, { method: "POST" });
      setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !currentStatus } : f));
      showSuccess("Updated", `Feature ${currentStatus ? "disabled" : "enabled"}.`);
    } catch {
      showSuccess("Error", "Failed to toggle feature.");
    }
  };

  const columns = [
    { key: "name", header: "Feature", render: (row: FeatureFlag) => <div><p className="font-medium">{row.name}</p><p className="text-[10px] text-slate-400">{row.key}</p></div> },
    { key: "description", header: "Description", render: (row: FeatureFlag) => <span className="text-slate-600">{row.description}</span> },
    { key: "scope", header: "Scope", render: (row: FeatureFlag) => <Badge variant="info">{row.scope}</Badge> },
    { key: "enabled", header: "Status", render: (row: FeatureFlag) => <Badge variant={row.enabled ? "success" : "muted"}>{row.enabled ? "Enabled" : "Disabled"}</Badge> },
    { key: "lastModifiedBy", header: "Modified By", render: (row: FeatureFlag) => <span className="text-slate-500">{row.lastModifiedBy}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Feature Flags" description="Manage platform feature flags and toggles." actions={canManage ? <Link to="/saas/features/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Settings className="h-4 w-4" /> Add Feature</Link> : null} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading features…</span></div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search features…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
          </div>
          <DataTable columns={columns} rows={features} rowKey={(r) => r.id} loading={loading} emptyDescription="No feature flags found." />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
