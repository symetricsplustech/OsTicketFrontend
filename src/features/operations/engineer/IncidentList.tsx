import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Search, Filter,
  ChevronDown, ChevronRight, X,
} from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { EntityListPage } from "@page-shells/EntityListPage";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { StatusBadge } from "@shared/components/Badge";

type ViewType = "all" | "my" | "myGroup" | "unassigned" | "critical" | "slaRisk" | "onHold" | "resolved";
type DomainType = "incidents" | "problems" | "changes";

interface IncidentRecord {
  id: string;
  number: string;
  title: string;
  state: string;
  priority: string;
  caller: string;
  service: string;
  ci: string;
  group: string;
  assignedTo: string;
  sla: string;
  updated: string;
}

const viewConfig: Record<ViewType, { label: string; color: string }> = {
  all: { label: "All Permitted", color: "default" },
  my: { label: "My Incidents", color: "info" },
  myGroup: { label: "My Group", color: "info" },
  unassigned: { label: "Unassigned", color: "warning" },
  critical: { label: "Critical", color: "danger" },
  slaRisk: { label: "SLA Risk", color: "warning" },
  onHold: { label: "On Hold", color: "muted" },
  resolved: { label: "Resolved", color: "success" },
};

const allIncidents: IncidentRecord[] = [
  { id: "1", number: "INC001042", title: "VPN access fails after password reset", state: "In Progress", priority: "P1", caller: "Maya Shah", service: "VPN", ci: "VPN-Gateway", group: "Service Desk L2", assignedTo: "Aarav Mehta", sla: "15m", updated: "8 min ago" },
  { id: "2", number: "INC001039", title: "Finance printer unavailable on level 4", state: "Assigned", priority: "P3", caller: "Priya Patel", service: "Printer", ci: "HP-LaserJet", group: "Service Desk L1", assignedTo: "Neha Singh", sla: "1h", updated: "21 min ago" },
  { id: "3", number: "INC001045", title: "Database connection timeout errors", state: "New", priority: "P1", caller: "Rohan Kumar", service: "Database", ci: "PG-Primary", group: "Unassigned", assignedTo: "—", sla: "5m", updated: "3 min ago" },
  { id: "4", number: "INC001030", title: "Network connectivity restored", state: "Resolved", priority: "P2", caller: "Aarav Mehta", service: "Network", ci: "Core-Switch", group: "Service Desk L2", assignedTo: "Neha Singh", sla: "30m", updated: "1 day ago" },
  { id: "5", number: "INC001050", title: "CRM integration failing silently", state: "On Hold", priority: "P2", caller: "Kabir Rao", service: "CRM", ci: "Salesforce", group: "Service Desk L2", assignedTo: "Kabir Rao", sla: "2h", updated: "4 hr ago" },
];

const problemIncidents: IncidentRecord[] = allIncidents.filter((i) => i.number.startsWith("PRB") || i.priority === "P1");
const changeIncidents: IncidentRecord[] = allIncidents.filter((i) => i.number.startsWith("CHG"));

export function IncidentList({ domain = "incidents" }: { domain?: DomainType }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const data = domain === "problems" ? problemIncidents : domain === "changes" ? changeIncidents : allIncidents;

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = `${item.number} ${item.title} ${item.caller} ${item.assignedTo}`.toLowerCase().includes(search.toLowerCase());
      const matchView = activeView === "all" ? true : activeView === "my" ? item.assignedTo !== "—" : activeView === "myGroup" ? item.group === "Service Desk L2" : activeView === "unassigned" ? item.assignedTo === "—" : activeView === "critical" ? item.priority === "P1" : activeView === "slaRisk" ? item.sla === "5m" || item.sla === "15m" : activeView === "onHold" ? item.state === "On Hold" : item.state === "Resolved";
      const matchStatus = !statusFilter || item.state.toLowerCase().includes(statusFilter.toLowerCase());
      return matchSearch && matchView && matchStatus;
    });
  }, [data, activeView, search, statusFilter]);

  const columns = [
    { key: "number", header: "Number", render: (row: IncidentRecord) => <button onClick={() => navigate(`/instances/1/workspace/incidents/${row.id}`)} className="font-bold text-cyan-700 hover:underline">{row.number}</button> },
    { key: "title", header: "Short description", render: (row: IncidentRecord) => <span className="font-medium">{row.title}</span> },
    { key: "state", header: "State", render: (row: IncidentRecord) => <StatusBadge status={row.state} /> },
    { key: "priority", header: "Priority", render: (row: IncidentRecord) => <Badge variant={row.priority === "P1" ? "danger" : row.priority === "P2" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "caller", header: "Caller", render: (row: IncidentRecord) => <span>{row.caller}</span> },
    { key: "service", header: "Service", render: (row: IncidentRecord) => <span>{row.service}</span> },
    { key: "group", header: "Group", render: (row: IncidentRecord) => <span>{row.group}</span> },
    { key: "assignedTo", header: "Assigned to", render: (row: IncidentRecord) => <span>{row.assignedTo}</span> },
    { key: "sla", header: "SLA", render: (row: IncidentRecord) => <Badge variant={row.sla === "5m" ? "danger" : row.sla === "15m" ? "warning" : "success"}>{row.sla}</Badge> },
    { key: "updated", header: "Updated", render: (row: IncidentRecord) => <span className="text-slate-500">{row.updated}</span> },
  ];

  const views: ViewType[] = domain === "problems" ? ["all", "my", "critical", "slaRisk", "onHold", "resolved"] : domain === "changes" ? ["all", "my", "critical", "slaRisk", "onHold", "resolved"] : ["all", "my", "myGroup", "unassigned", "critical", "slaRisk", "onHold", "resolved"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={domain === "problems" ? "Problem List" : domain === "changes" ? "Change List" : "Incident List"}
        description={`Browse and filter ${domain} records. Use predefined views to quickly find records.`}
        actions={
          <div className="flex gap-2">
            <PermissionGate permissions={["itsm.incident.create"]}>
              <Button>New {domain === "problems" ? "Problem" : domain === "changes" ? "Change" : "Incident"}</Button>
            </PermissionGate>
            <Button variant="outline">Refresh</Button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title={`${domain === "problems" ? "Problems" : domain === "changes" ? "Changes" : "Incidents"} — ${viewConfig[activeView].label}`}
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={`Search ${domain}…`}
                  className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold">
                <Filter className="h-3.5 w-3.5" /> Filters
              </button>
            </div>
          }
        />
        {showFilters && (
          <CardBody className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">State</label>
                <select className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm">
                  <option value="">All states</option>
                  {["New", "In Progress", "On Hold", "Resolved", "Closed"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
                <select className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm">
                  <option value="">All priorities</option>
                  {["P1", "P2", "P3", "P4"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Service</label>
                <input type="text" placeholder="Filter by service" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
          </CardBody>
        )}

        <div className="flex gap-1 border-b px-4 overflow-x-auto">
          {views.map((view) => (
            <button
              key={view}
              onClick={() => { setActiveView(view); setPage(1); }}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold ${activeView === view ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500 hover:bg-slate-100"}`}
            >
              {viewConfig[view].label}
              <span className="ml-1 text-[10px] text-slate-400">({filtered.length})</span>
            </button>
          ))}
        </div>

        <CardBody className="p-0">
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No records found" emptyDescription="Try adjusting your search or filters." />
          <Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} />
        </CardBody>
      </Card>
    </div>
  );
}
