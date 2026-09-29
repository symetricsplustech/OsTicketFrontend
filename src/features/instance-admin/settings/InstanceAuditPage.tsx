import { useState, useParams } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShieldCheck, Clock, FileSearch, AlertTriangle } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { useAuditQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import type { AuditEvent } from "@shared/types";

export function InstanceAuditPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const permissions = useAppSelector(selectPermissions);
  const canRead = permissions.includes(PERMISSIONS.auditRead) || permissions.includes("*");

  const { data, isLoading, isError } = useAuditQuery({ actor: actorFilter || undefined, action: actionFilter || undefined, page: 1, limit: 50 }, { skip: !instanceId });

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (row: AuditEvent) => new Date(row.createdAt).toLocaleString() },
    { key: "actor", header: "Actor", render: (row: AuditEvent) => row.actorId?.name ?? row.actorId?.email ?? "—" },
    { key: "action", header: "Action", render: (row: AuditEvent) => <Badge variant="info">{row.action}</Badge> },
    { key: "resourceType", header: "Resource", render: (row: AuditEvent) => `${row.resourceType} #${row.resourceId ?? "—"}` },
    { key: "outcome", header: "Outcome", render: (row: AuditEvent) => <Badge variant={row.outcome === "success" ? "success" : row.outcome === "failure" ? "danger" : "warning"}>{row.outcome}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Instance Audit"
        description="Explore audit events for this instance."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
      />
      <Card>
        <CardHeader title="Audit Explorer" icon={<ShieldCheck className="h-4 w-4 text-brand-600" />} description={`${data?.total ?? 0} events`} />
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
            <Input placeholder="Actor" value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="w-40" />
            <Input placeholder="Action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-40" />
            <Button variant="outline" size="sm"><Filter className="h-3 w-3 mr-1" /> Filter</Button>
          </div>
          {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading audit events…</p> : isError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load audit events.</p> : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                rows={data?.events ?? []}
                rowKey={(row: AuditEvent) => row.id}
                loading={isLoading}
                emptyDescription="No audit events found."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}


