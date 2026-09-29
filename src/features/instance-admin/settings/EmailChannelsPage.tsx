import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search, Mail, ArrowDown, ArrowUp, RefreshCw, CheckCircle, Clock, FileText, Reply, Paperclip, BarChart } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge, Tabs } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { useTeamsQuery } from "@shared/api/instanceApi";
import type { TeamSummary } from "@shared/types";

export function EmailChannelsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTeamsQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState("overview");
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const channels = (data?.items ?? []).filter((item: TeamSummary) => item.kind === "email" || item.kind === "channel");
  const filtered = channels.filter((channel: TeamSummary) => channel.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const columns = [
    { key: "name", header: "Channel", render: (row: TeamSummary) => <Link to={`${row.id}`} className="font-semibold text-cyan-700 hover:underline">{row.name}</Link> },
    { key: "kind", header: "Type", render: (row: TeamSummary) => <Badge variant="info">{row.kind}</Badge> },
    { key: "status", header: "Inbound", render: () => <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1 inline" />Active</Badge> },
    { key: "status", header: "Outbound", render: () => <Badge variant="success"><ArrowUp className="h-3 w-3 mr-1 inline" />Active</Badge> },
    { key: "members", header: "Status", render: () => <Badge variant="success">Active</Badge> },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "inbound", label: "Inbound" },
    { id: "outbound", label: "Outbound" },
    { id: "routing", label: "Routing" },
    { id: "records", label: "Record Creation" },
    { id: "reply", label: "Reply Correlation" },
    { id: "attachments", label: "Attachments" },
    { id: "delivery", label: "Delivery Logs" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div>
      <PageHeader
        title="Email Channels"
        description="Manage email inbound/outbound channels, routing, and delivery."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
        actions={canCreate ? <Button size="sm">Add Channel</Button> : undefined}
      />
      <Card>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <CardBody>
          {activeTab === "overview" ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search channels…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
                </div>
              </div>
              {isLoading ? <p className="py-12 text-center text-sm text-slate-500">Loading channels…</p> : isError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load channels.</p> : filtered.length === 0 ? <EmptyState title="No channels" description="Add an email channel to receive and process emails." /> : <DataTable columns={columns} rows={filtered} rowKey={(row: TeamSummary) => row.id} onRowClick={(row: TeamSummary) => navigate(`/instances/${instanceId}/admin/settings/email-channels/${row.id}`)} />}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab content</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
