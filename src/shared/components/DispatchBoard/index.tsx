import { useState, useMemo } from "react";
import {
  Search, Filter, CalendarDays, MapPin, Clock3,
  AlertTriangle, UserPlus, ArrowRightLeft, CalendarCheck,
  ShieldAlert, FolderOpen, CheckCircle2, PlayCircle,
  Loader2, Wrench, Package, Truck, MapPin as MapPinIcon,
  Gauge, ChevronDown, X,
} from "lucide-react";
import { Input } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { cn } from "@shared/lib/cn";
import type { Engineer } from "@shared/components/EngineerPicker";

export type DispatchColumn =
  | "unassigned"
  | "offered"
  | "accepted"
  | "scheduled"
  | "en_route"
  | "on_site"
  | "in_progress"
  | "completed";

export interface DispatchTicket {
  id: string;
  number: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  slaRisk: "none" | "warning" | "breach" | "critical";
  group: string;
  territory: string;
  location: string;
  skill: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: Engineer;
  status: DispatchColumn;
}

export interface DispatchFilter {
  dateFrom?: string;
  dateTo?: string;
  group?: string;
  territory?: string;
  location?: string;
  skill?: string;
  priority?: string;
  slaRisk?: string;
}

interface DispatchBoardProps {
  tickets: DispatchTicket[];
  loading?: boolean;
  onAssign?: (ticketId: string, engineer: Engineer) => void;
  onReassign?: (ticketId: string, engineer: Engineer) => void;
  onSchedule?: (ticketId: string, date: string) => void;
  onEscalate?: (ticketId: string, reason: string) => void;
  onEngineerOpen?: () => void;
  onTicketOpen?: (ticketId: string) => void;
}

const columns: { key: DispatchColumn; label: string; icon: typeof CalendarDays; color: string }[] = [
  { key: "unassigned", label: "Unassigned", icon: FolderOpen, color: "bg-slate-400" },
  { key: "offered", label: "Offered", icon: ArrowRightLeft, color: "bg-amber-400" },
  { key: "accepted", label: "Accepted", icon: CheckCircle2, color: "bg-emerald-400" },
  { key: "scheduled", label: "Scheduled", icon: CalendarCheck, color: "bg-blue-400" },
  { key: "en_route", label: "En Route", icon: Truck, color: "bg-indigo-400" },
  { key: "on_site", label: "On Site", icon: MapPinIcon, color: "bg-cyan-400" },
  { key: "in_progress", label: "In Progress", icon: PlayCircle, color: "bg-purple-400" },
  { key: "completed", label: "Completed", icon: Gauge, color: "bg-slate-500" },
];

const priorityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const slaStyles = {
  none: "",
  warning: "ring-amber-400",
  breach: "ring-red-400",
  critical: "ring-red-600 bg-red-50",
};

export function DispatchBoard({
  tickets, loading, onAssign, onReassign, onSchedule, onEscalate, onEngineerOpen, onTicketOpen,
}: DispatchBoardProps) {
  const [activeFilter, setActiveFilter] = useState<DispatchColumn>("unassigned");
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filters, setFilters] = useState<DispatchFilter>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (activeFilter && ticket.status !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!ticket.title.toLowerCase().includes(q) && !ticket.number.toLowerCase().includes(q)) return false;
      }
      if (filters.group && ticket.group !== filters.group) return false;
      if (filters.territory && ticket.territory !== filters.territory) return false;
      if (filters.location && ticket.location !== filters.location) return false;
      if (filters.skill && ticket.skill !== filters.skill) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.slaRisk && ticket.slaRisk !== filters.slaRisk) return false;
      if (filters.dateFrom && ticket.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && ticket.createdAt > filters.dateTo) return false;
      return true;
    });
  }, [tickets, activeFilter, searchQuery, filters]);

  const groupByColumn = useMemo(() => {
    const grouped: Record<DispatchColumn, DispatchTicket[]> = {
      unassigned: [], offered: [], accepted: [], scheduled: [],
      en_route: [], on_site: [], in_progress: [], completed: [],
    };
    filteredTickets.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [filteredTickets]);

  const handleFilterChange = (key: keyof DispatchFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <div className="space-y-4">
      <CardHeader
        title="Dispatch Board"
        description="Manage tickets across all lifecycle columns"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilterExpanded(!filterExpanded)}>
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>
            <Button variant="outline" size="sm" onClick={onEngineerOpen}><UserPlus className="h-3.5 w-3.5" /> Engineer</Button>
          </div>
        }
      />

      {filterExpanded && (
        <Card className="border-amber-200 bg-amber-50">
          <CardBody>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Date From</label>
                <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => handleFilterChange("dateFrom", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Date To</label>
                <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => handleFilterChange("dateTo", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Group</label>
                <Input placeholder="Group" value={filters.group ?? ""} onChange={(e) => handleFilterChange("group", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Territory</label>
                <Input placeholder="Territory" value={filters.territory ?? ""} onChange={(e) => handleFilterChange("territory", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
                <Input placeholder="Location" value={filters.location ?? ""} onChange={(e) => handleFilterChange("location", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Skill</label>
                <Input placeholder="Skill" value={filters.skill ?? ""} onChange={(e) => handleFilterChange("skill", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
                <select className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" value={filters.priority ?? ""} onChange={(e) => handleFilterChange("priority", e.target.value)}>
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">SLA Risk</label>
                <select className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" value={filters.slaRisk ?? ""} onChange={(e) => handleFilterChange("slaRisk", e.target.value)}>
                  <option value="">All</option>
                  <option value="none">None</option>
                  <option value="warning">Warning</option>
                  <option value="breach">Breach</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            {(filters.group || filters.territory || filters.location || filters.skill || filters.priority || filters.slaRisk || filters.dateFrom || filters.dateTo) && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFilters({})}><X className="h-3 w-3" /> Clear filters</Button>
            )}
          </CardBody>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400" />
        <Input placeholder="Search tickets…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
        <div className="flex gap-1 overflow-x-auto">
          {columns.map((col) => (
            <button key={col.key} onClick={() => setActiveFilter(col.key)} className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeFilter === col.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}>
              <col.icon className="h-3 w-3" />
              {col.label}
              <span className={cn("ml-0.5 rounded-full px-1.5 py-0.5 text-[10px]", activeFilter === col.key ? "bg-brand-700 text-brand-100" : "bg-slate-200 text-slate-600")}>
                {groupByColumn[col.key].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <div className="grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div key={col.key} className="min-w-[280px] rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                <div className={cn("h-2 w-2 rounded-full", col.color)} />
                <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{groupByColumn[col.key].length}</span>
              </div>
              <div className="space-y-2 p-2">
                {groupByColumn[col.key].map((ticket) => (
                  <div key={ticket.id} onClick={() => onTicketOpen?.(ticket.id)} className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-700">{ticket.number}</p>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-800">{ticket.title}</p>
                      </div>
                      <Badge variant={ticket.priority === "critical" || ticket.priority === "high" ? "danger" : ticket.priority === "medium" ? "warning" : "muted"}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <MapPinIcon className="h-3 w-3" />{ticket.location}
                      <span>·</span>
                      <span className={cn("rounded-full px-1 py-0.5", slaStyles[ticket.slaRisk] || "")}>{ticket.slaRisk}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-700">
                            {ticket.assignedTo.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] text-slate-600">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Unassigned</span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {onAssign && ticket.status === "unassigned" && (
                        <Button variant="outline" size="sm" className="text-[10px]" onClick={(e) => { e.stopPropagation(); onAssign(ticket.id, ticket.assignedTo!); }}>Assign</Button>
                      )}
                      {onReassign && ticket.assignedTo && (
                        <Button variant="outline" size="sm" className="text-[10px]" onClick={(e) => { e.stopPropagation(); onReassign(ticket.id, ticket.assignedTo!); }}>Reassign</Button>
                      )}
                      {onSchedule && (ticket.status === "accepted" || ticket.status === "offered") && (
                        <Button variant="outline" size="sm" className="text-[10px]" onClick={(e) => { e.stopPropagation(); onSchedule(ticket.id, new Date().toISOString()); }}>Schedule</Button>
                      )}
                      {onEscalate && ticket.slaRisk !== "none" && (
                        <Button variant="danger" size="sm" className="text-[10px]" onClick={(e) => { e.stopPropagation(); onEscalate(ticket.id, "SLA risk detected"); }}>Escalate</Button>
                      )}
                    </div>
                  </div>
                ))}
                {groupByColumn[col.key].length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">No tickets</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
