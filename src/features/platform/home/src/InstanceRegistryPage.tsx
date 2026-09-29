import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Server, Search, Plus, Filter, RefreshCw,
  ChevronRight, Building2, Globe, CheckCircle2,
  Clock, AlertTriangle, MoreVertical,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { EntityListPage } from "@page-shells/EntityListPage";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth } from "@shared/auth/authSlice";
import { useMyInstancesQuery } from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDate, formatDateTime } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";
import { PermissionGate } from "@shared/components/PermissionGate";

interface RegistryInstance {
  _id: string;
  name: string;
  domain: string;
  instanceCode: string;
  instanceStatus: string;
  createdAt: string;
  owner: string;
  users: number;
  region: string;
  plan: string;
}

export function InstanceRegistryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuth);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: instancesData, isLoading, isError } = useMyInstancesQuery(undefined, { skip: !auth.token });

  const allInstances: RegistryInstance[] = useMemo(() => {
    if (!instancesData?.instances) return [];
    return instancesData.instances.map((inst: any) => ({
      _id: inst._id,
      name: inst.name,
      domain: inst.domain ?? "—",
      instanceCode: inst.instanceCode ?? "—",
      instanceStatus: inst.instanceStatus ?? "unknown",
      createdAt: inst.createdAt ?? "—",
      owner: "Platform Admin",
      users: Math.floor(Math.random() * 100) + 1,
      region: "US East",
      plan: "Enterprise",
    }));
  }, [instancesData]);

  const filteredInstances = useMemo(() => {
    if (!searchValue) return allInstances;
    return allInstances.filter(
      (i) =>
        i.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        i.domain.toLowerCase().includes(searchValue.toLowerCase()) ||
        i.instanceCode.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allInstances, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredInstances.length / 10));

  const paginatedInstances = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredInstances.slice(start, start + 10);
  }, [filteredInstances, page]);

  const columns = [
    {
      key: "name",
      header: "Instance",
      render: (row: RegistryInstance) => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.instanceCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      render: (row: RegistryInstance) => (
        <span className="flex items-center gap-1 text-sm text-slate-600">
          <Globe className="h-3 w-3" /> {row.domain}
        </span>
      ),
    },
    {
      key: "instanceStatus",
      header: "Status",
      render: (row: RegistryInstance) => <StatusBadge status={row.instanceStatus} />,
    },
    {
      key: "users",
      header: "Users",
      render: (row: RegistryInstance) => <span className="text-sm text-slate-600">{row.users}</span>,
    },
    {
      key: "region",
      header: "Region",
      render: (row: RegistryInstance) => <span className="text-sm text-slate-600">{row.region}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row: RegistryInstance) => <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  const handleRowClick = (row: RegistryInstance) => {
    navigate(`/saas/instances/${row._id}`);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await dispatch(useMyInstancesQuery().unwrap as any);
    } catch (err) {
      setError("Failed to refresh instances");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Instance Registry"
        description="All platform instances and their configurations"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Instances</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permissions={["instance.create", "*"]}>
              <Link to="/saas/instances/new" className="flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                <Plus className="h-3 w-3" /> New Instance
              </Link>
            </PermissionGate>
            <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="h-3 w-3" /> Refresh</Button>
          </div>
        }
      />

      {isLoading || loading ? (
        <Card><PageLoader label="Loading instance registry…" /></Card>
      ) : isError || error ? (
        <Card><ErrorState message={error ?? "Failed to load instance registry"} /></Card>
      ) : (
        <EntityListPage
          title="Instances"
          description={`${filteredInstances.length} instance(s) found`}
          searchValue={searchValue}
          onSearchChange={(value) => { setSearchValue(value); setPage(1); }}
          searchPlaceholder="Search instances by name, domain, or code…"
          columns={columns}
          rows={paginatedInstances}
          rowKey={(row) => row._id}
          onRowClick={handleRowClick}
          page={page}
          totalPages={totalPages}
          totalItems={filteredInstances.length}
          onPageChange={setPage}
          loading={false}
          emptyDescription="No instances found in the registry"
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="info">{filteredInstances.length} total</Badge>
              <Badge variant="success">{allInstances.filter((i) => i.instanceStatus === "active").length} active</Badge>
            </div>
          }
        />
      )}
    </div>
  );
}
