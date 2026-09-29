import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search, Shield, Lock } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { RoleEditorPage } from "@page-shells/RoleEditorPage";
import { useRolesQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import type { RoleSummaryOptions } from "@shared/types";

export function RolesPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRolesQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [editingRole, setEditingRole] = useState<RoleSummaryOptions | null>(null);
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const filtered = (data?.items ?? []).filter((item: RoleSummaryOptions) =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns = [
    { key: "name", header: "Role", render: (row: RoleSummaryOptions) => <Link to={`${row.id}`} className="font-semibold text-cyan-700 hover:underline">{row.name}</Link> },
    { key: "isActive", header: "Status", render: (row: RoleSummaryOptions) => <Badge variant={row.isActive ? "success" : "warning"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "members", header: "Members", render: () => <span className="text-slate-600">0</span> },
    { key: "actions", header: "Actions", render: (row: RoleSummaryOptions) => <Button size="sm" variant="outline" onClick={() => setEditingRole(row)}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Roles" description="Manage roles and their permissions." breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>} actions={canCreate ? <Button size="sm">Create Role</Button> : undefined} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
          </div>
        </div>
        {isLoading ? <CardBody><p className="py-12 text-center text-sm text-slate-500">Loading roles…</p></CardBody> : isError ? <CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load roles.</p></CardBody> : filtered.length === 0 ? <CardBody><p className="rounded-lg border border-dashed px-10 py-8 text-center text-sm text-slate-500">No roles found.</p></CardBody> :
          <DataTable columns={columns} rows={filtered} rowKey={(row: RoleSummaryOptions) => row._id ?? row.id} onRowClick={(row: RoleSummaryOptions) => setEditingRole(row)} />
        }
      </Card>
      {editingRole && (
        <RoleEditorPage
          role={{
            id: editingRole._id ?? editingRole.id,
            name: editingRole.name,
            isActive: editingRole.isActive ?? true,
            permissions: [],
            scopes: [],
            isBuiltIn: false,
          }}
          onRoleSave={(role) => { setEditingRole(null); }}
          onRoleCancel={() => setEditingRole(null)}
        />
      )}
    </div>
  );
}
