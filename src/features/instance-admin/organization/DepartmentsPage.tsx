import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, EmptyState } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { DataTable } from "@shared/components/DataTable";
import { useOrganizationUnitsQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import type { OrgUnitSummary } from "@shared/types";

export function DepartmentsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOrganizationUnitsQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const departments = (data?.items ?? []).filter((item: OrgUnitSummary) => item.type === "department");
  const filtered = departments.filter((dept: OrgUnitSummary) => dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const columns = [
    { key: "name", header: "Department", render: (row: OrgUnitSummary) => <Link to={`${row.id}`} className="font-semibold text-cyan-700 hover:underline">{row.name}</Link> },
    { key: "type", header: "Type", render: (row: OrgUnitSummary) => <Badge variant="info">{row.type}</Badge> },
    { key: "parent", header: "Business Unit", render: (row: OrgUnitSummary) => <span className="text-slate-500">{row.parent_id ?? "—"}</span> },
    { key: "members", header: "Members", render: () => <span className="text-slate-600">0</span> },
    { key: "status", header: "Status", render: () => <Badge variant="success">Active</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Departments" description="Manage departments within business units." breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>} actions={canCreate ? <Button size="sm">Create</Button> : undefined} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
          </div>
        </div>
        {isLoading ? <CardBody><p className="py-12 text-center text-sm text-slate-500">Loading departments…</p></CardBody> : isError ? <CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load departments.</p></CardBody> : filtered.length === 0 ? <CardBody><EmptyState title="No departments" description="Create a department to organize your team members." /></CardBody> : <DataTable columns={columns} rows={filtered} rowKey={(row: OrgUnitSummary) => row.id} onRowClick={(row: OrgUnitSummary) => navigate(`/instances/${instanceId}/admin/organization/departments/${row.id}`)} />}
      </Card>
    </div>
  );
}
