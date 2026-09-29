import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search, Users, Clock, Shield, Settings, UserCheck, MessageSquare, BarChart3, Lock } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge, Tabs } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { useTeamsQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import type { TeamSummary } from "@shared/types";

export function GroupsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTeamsQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState("overview");
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const filtered = (data?.items ?? []).filter((item: TeamSummary) =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns = [
    { key: "name", header: "Group", render: (row: TeamSummary) => <Link to={`${row.id}`} className="font-semibold text-cyan-700 hover:underline">{row.name}</Link> },
    { key: "kind", header: "Kind", render: (row: TeamSummary) => <Badge variant="info">{row.kind}</Badge> },
    { key: "members", header: "Members", render: () => <span className="text-slate-600">0</span> },
    { key: "status", header: "Status", render: () => <Badge variant="success">Active</Badge> },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Users className="h-3.5 w-3.5" /> },
    { id: "members", label: "Members", icon: <UserCheck className="h-3.5 w-3.5" /> },
    { id: "managers", label: "Managers", icon: <Shield className="h-3.5 w-3.5" /> },
    { id: "roles", label: "Roles", icon: <Lock className="h-3.5 w-3.5" /> },
    { id: "queues", label: "Queues", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "scope", label: "Scope", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: "audit", label: "Audit", icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Groups"
        description="Manage assignment groups and distribution groups."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
        actions={canCreate ? <Button size="sm">Create Group</Button> : undefined}
      />
      <Card>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <CardBody>
          {activeTab === "overview" ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
                </div>
              </div>
              {isLoading ? <p className="py-12 text-center text-sm text-slate-500">Loading groups…</p> : isError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load groups.</p> : filtered.length === 0 ? <p className="rounded-lg border border-dashed px-10 py-8 text-center text-sm text-slate-500">No groups found.</p> : <DataTable columns={columns} rows={filtered} rowKey={(row: TeamSummary) => row.id} onRowClick={(row: TeamSummary) => navigate(`/instances/${instanceId}/admin/people/groups/${row.id}`)} />}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab content</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
