import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { useTeamsQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import type { TeamSummary } from "@shared/types";

export function AssignmentGroupsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTeamsQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const assignmentGroups = (data?.items ?? []).filter((item: TeamSummary) => item.kind === "assignment" || item.kind === "distribution");
  const filtered = assignmentGroups.filter((group: TeamSummary) =>
    group.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns = [
    { key: "name", header: "Assignment Group", render: (row: TeamSummary) => <Link to={`${row.id}`} className="font-semibold text-cyan-700 hover:underline">{row.name}</Link> },
    { key: "kind", header: "Kind", render: (row: TeamSummary) => <Badge variant="info">{row.kind}</Badge> },
    { key: "members", header: "Members", render: () => <span className="text-slate-600">0</span> },
    { key: "activeTickets", header: "Active Tickets", render: () => <span className="text-slate-600">0</span> },
    { key: "status", header: "Status", render: () => <Badge variant="success">Active</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Assignment Groups" description="Manage groups used for ticket and task assignment." breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>} actions={canCreate ? <Button size="sm">Create Group</Button> : undefined} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assignment groups…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
          </div>
        </div>
        {isLoading ? <CardBody><p className="py-12 text-center text-sm text-slate-500">Loading assignment groups…</p></CardBody> : isError ? <CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load assignment groups.</p></CardBody> : filtered.length === 0 ? <CardBody><p className="rounded-lg border border-dashed px-10 py-8 text-center text-sm text-slate-500">No assignment groups found.</p></CardBody> : <DataTable columns={columns} rows={filtered} rowKey={(row: TeamSummary) => row.id} onRowClick={(row: TeamSummary) => navigate(`/instances/${instanceId}/admin/people/assignment-groups/${row.id}`)} />}
      </Card>
    </div>
  );
}
