import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, CheckCircle2, Clock3, Filter,
  LayoutGrid, Search, TrendingUp, Users,
} from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { EntityListPage } from "@page-shells/EntityListPage";
import { DashboardPage } from "@page-shells/DashboardPage";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { StatusBadge } from "@shared/components/Badge";

interface WorkItem {
  id: string;
  number: string;
  title: string;
  state: string;
  priority: string;
  assignedTo: string;
  category: string;
  service: string;
  updated: string;
}

const tabData: Record<string, { label: string; icon: typeof ClipboardList; count: number }[]> = {
  assignedToMe: [
    { label: "Assigned to Me", icon: Users, count: 12 },
    { label: "Opened by Me", icon: ClipboardList, count: 5 },
    { label: "Watching", icon: TrendingUp, count: 3 },
  ],
  scheduled: [
    { label: "Scheduled", icon: Clock3, count: 8 },
    { label: "Waiting", icon: Filter, count: 4 },
    { label: "Completed", icon: CheckCircle2, count: 24 },
  ],
};

const myWorkItems: Record<string, WorkItem[]> = {
  assigned: [
    { id: "1", number: "INC001042", title: "VPN access fails after password reset", state: "In Progress", priority: "P2", assignedTo: "Aarav Mehta", category: "Network", service: "VPN", updated: "8 min ago" },
    { id: "2", number: "INC001039", title: "Finance printer unavailable on level 4", state: "Assigned", priority: "P3", assignedTo: "Neha Singh", category: "Hardware", service: "Printer", updated: "21 min ago" },
    { id: "3", number: "INC001035", title: "Email forwarding not working for domain", state: "New", priority: "P2", assignedTo: "Kabir Rao", category: "Email", service: "Exchange", updated: "1 hr ago" },
  ],
  opened: [
    { id: "4", number: "REQ002204", title: "New laptop and development software", state: "Pending Approval", priority: "P3", assignedTo: "Maya Shah", category: "Hardware", service: "IT Asset", updated: "43 min ago" },
    { id: "5", number: "REQ002199", title: "VPN client installation", state: "New", priority: "P4", assignedTo: "Aarav Mehta", category: "Network", service: "VPN", updated: "2 hr ago" },
  ],
  watching: [
    { id: "6", number: "CHG000882", title: "Upgrade customer identity gateway", state: "Scheduled", priority: "P2", assignedTo: "Kabir Rao", category: "Security", service: "IAM", updated: "1 hr ago" },
    { id: "7", number: "PRB000401", title: "Recurring authentication latency", state: "Root Cause", priority: "P1", assignedTo: "Riya Verma", category: "Security", service: "IAM", updated: "2 hr ago" },
  ],
  scheduled: [
    { id: "8", number: "CHG000890", title: "Quarterly security patch deployment", state: "Scheduled", priority: "P1", assignedTo: "Team", category: "Security", service: "Infrastructure", updated: "3 hr ago" },
  ],
  waiting: [
    { id: "9", number: "REQ002210", title: "Waiting on customer response", state: "Waiting", priority: "P4", assignedTo: "—", category: "General", service: "—", updated: "5 hr ago" },
  ],
  completed: [
    { id: "10", number: "INC001030", title: "Network connectivity restored", state: "Resolved", priority: "P2", assignedTo: "Neha Singh", category: "Network", service: "VPN", updated: "1 day ago" },
    { id: "11", number: "INC001028", title: "Email forwarding configured", state: "Closed", priority: "P3", assignedTo: "Kabir Rao", category: "Email", service: "Exchange", updated: "2 days ago" },
  ],
};

const tabs = [
  { id: "assignedToMe", label: "Assigned to Me" },
  { id: "openedByMe", label: "Opened by Me" },
  { id: "watching", label: "Watching" },
  { id: "scheduled", label: "Scheduled" },
  { id: "waiting", label: "Waiting" },
  { id: "completed", label: "Completed" },
];

export function MyWork() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assignedToMe");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const permissions = useAppSelector(selectPermissions);

  const items = myWorkItems[activeTab] ?? [];
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = `${item.number} ${item.title} ${item.assignedTo}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || item.state.toLowerCase().includes(statusFilter.toLowerCase());
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const columns = [
    { key: "number", header: "Number", render: (row: WorkItem) => <button onClick={() => navigate(`/instances/1/workspace/incidents/${row.id}`)} className="font-bold text-cyan-700 hover:underline">{row.number}</button> },
    { key: "title", header: "Title", render: (row: WorkItem) => <span className="font-medium">{row.title}</span> },
    { key: "state", header: "State", render: (row: WorkItem) => <StatusBadge status={row.state} /> },
    { key: "priority", header: "Priority", render: (row: WorkItem) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "category", header: "Category", render: (row: WorkItem) => <span>{row.category}</span> },
    { key: "service", header: "Service", render: (row: WorkItem) => <span>{row.service}</span> },
    { key: "updated", header: "Updated", render: (row: WorkItem) => <span className="text-slate-500">{row.updated}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Work"
        description="View and manage all your assigned, opened, watching, scheduled, waiting, and completed work items."
        actions={
          <div className="flex gap-2">
            <PermissionGate permissions={["itsm.incident.create"]}>
              <Button>New Incident</Button>
            </PermissionGate>
            <Button variant="outline">Refresh</Button>
          </div>
        }
      />

      <DashboardPage
        title="Work Summary"
        kpiCounts={[
          { label: "Assigned", value: items.length, trend: "up", trendValue: "+3" },
          { label: "Overdue", value: 3, trend: "down", trendValue: "-1" },
          { label: "SLA At Risk", value: 2, trend: "up", trendValue: "+1" },
        ]}
        loading={false}
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <Card>
        <CardHeader
          title={tabs.find((t) => t.id === activeTab)?.label ?? "My Work"}
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search work items…"
                  className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-md border border-slate-300 bg-white py-1.5 px-3 text-sm"
              >
                <option value="">All states</option>
                {["New", "In Progress", "Assigned", "Resolved", "Closed"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          }
        />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No work items found" emptyDescription="Try adjusting your search or filters." />
          <Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} />
        </CardBody>
      </Card>
    </div>
  );
}
