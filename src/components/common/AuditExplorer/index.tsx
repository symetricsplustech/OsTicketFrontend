import { useState, useMemo } from "react";
import {
  ShieldCheck, Search, Filter, Download, Eye, FileText,
  Clock3, User, Tag, Hash, Calendar, GitBranch,
  ArrowRightLeft, AlertTriangle, Loader2, ChevronDown, X,
} from "lucide-react";
import { Input } from "@components/common/ui";
import { Button } from "@components/common/ui";
import { Card, CardBody, CardHeader } from "@components/common/ui";
import { Badge } from "@components/common/Badge";
import { DataTable } from "@components/common/DataTable";
import { cn } from "@utils/cn";
import { useCan } from "@services/authorization/permissions";
import type { AuditEvent } from "@types";

export interface AuditExplorerEntry {
  id: string;
  timestamp: string;
  actor: { name: string; email?: string };
  action: string;
  resourceType: string;
  resourceId: string;
  before?: string;
  after?: string;
  correlationId?: string;
  instanceId?: string;
  reason?: string;
  ip?: string;
}

interface AuditExplorerProps {
  entries: AuditExplorerEntry[];
  loading?: boolean;
  onFilter?: (filters: AuditFilter) => void;
  onExport?: () => void;
}

export interface AuditFilter {
  actor?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  correlationId?: string;
}

const actionColors: Record<string, string> = {
  CREATE: "info",
  UPDATE: "warning",
  DELETE: "danger",
  ASSIGN: "success",
  REASSIGN: "info",
  ESCALATE: "danger",
  APPROVE: "success",
  REJECT: "danger",
  SCHEDULE: "warning",
  CLOSE: "muted",
  OPEN: "info",
};

export function AuditExplorer({ entries, loading, onFilter, onExport }: AuditExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const canExport = useCan("itsm.core.audit_export");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!entry.actor.name.toLowerCase().includes(q) && !entry.action.toLowerCase().includes(q) && !entry.resourceType.toLowerCase().includes(q) && !entry.resourceId.toLowerCase().includes(q) && !entry.correlationId?.toLowerCase().includes(q)) return false;
      }
      if (filters.actor && !entry.actor.name.toLowerCase().includes(filters.actor.toLowerCase())) return false;
      if (filters.action && !entry.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
      if (filters.resourceType && entry.resourceType !== filters.resourceType) return false;
      if (filters.resourceId && !entry.resourceId.toLowerCase().includes(filters.resourceId.toLowerCase())) return false;
      if (filters.dateFrom && entry.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && entry.timestamp > filters.dateTo) return false;
      if (filters.correlationId && entry.correlationId !== filters.correlationId) return false;
      return true;
    });
  }, [entries, searchQuery, filters]);

  const handleFilterChange = (key: keyof AuditFilter, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleExport = () => {
    if (!canExport) return;
    onExport?.();
  };

  const selectedEntryData = selectedEntry ? filteredEntries.find((e) => e.id === selectedEntry) : null;

  return (
    <Card>
      <CardHeader
        title="Audit Explorer"
        description="Full audit trail with permission-aware filtering"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input placeholder="Search audit…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-48" />
            </div>
            {canExport && onExport ? (
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-3.5 w-3.5" /> Export</Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setExpandedFilters(!expandedFilters)}>
              <Filter className="h-3.5 w-3.5" /> {expandedFilters ? "Hide" : "Filters"}
            </Button>
          </div>
        }
      />

      <CardBody>
        {expandedFilters && (
          <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><User className="h-3 w-3 inline" /> Actor</label>
              <Input placeholder="Actor name" value={filters.actor ?? ""} onChange={(e) => handleFilterChange("actor", e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><Tag className="h-3 w-3 inline" /> Action</label>
              <select className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={filters.action ?? ""} onChange={(e) => handleFilterChange("action", e.target.value)}>
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="ASSIGN">Assign</option>
                <option value="REASSIGN">Reassign</option>
                <option value="ESCALATE">Escalate</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><Tag className="h-3 w-3 inline" /> Resource Type</label>
              <Input placeholder="Resource type" value={filters.resourceType ?? ""} onChange={(e) => handleFilterChange("resourceType", e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><Hash className="h-3 w-3 inline" /> Resource ID</label>
              <Input placeholder="Resource ID" value={filters.resourceId ?? ""} onChange={(e) => handleFilterChange("resourceId", e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><Calendar className="h-3 w-3 inline" /> Date From</label>
              <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => handleFilterChange("dateFrom", e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><Calendar className="h-3 w-3 inline" /> Date To</label>
              <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => handleFilterChange("dateTo", e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600"><GitBranch className="h-3 w-3 inline" /> Correlation ID</label>
              <Input placeholder="Correlation ID" value={filters.correlationId ?? ""} onChange={(e) => handleFilterChange("correlationId", e.target.value)} className="w-full" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{filteredEntries.length} entries</span>
          {Object.values(filters).some((v) => v) ? <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setSearchQuery(""); }}><X className="h-3 w-3" /> Clear all</Button> : null}
        </div>

        <DataTable
          columns={[
            { key: "timestamp", header: "When", render: (row: AuditExplorerEntry) => <span className="text-xs text-slate-600">{new Date(row.timestamp).toLocaleString()}</span> },
            { key: "actor", header: "Who", render: (row: AuditExplorerEntry) => <span className="text-xs font-medium">{row.actor.name}</span> },
            { key: "action", header: "Action", render: (row: AuditExplorerEntry) => <Badge variant={actionColors[row.action] ?? "default"}>{row.action}</Badge> },
            { key: "resourceType", header: "Resource", render: (row: AuditExplorerEntry) => <span className="text-xs">{row.resourceType} #{row.resourceId}</span> },
            { key: "correlationId", header: "Correlation", render: (row: AuditExplorerEntry) => <span className="text-xs text-slate-500">{row.correlationId ?? "—"}</span> },
          ]}
          rows={filteredEntries}
          rowKey={(r) => r.id}
          onRowClick={(row) => setSelectedEntry(row.id === selectedEntry ? null : row.id)}
          emptyDescription="No audit entries found"
          loading={loading}
        />

        {selectedEntryData && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Audit Detail</h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)}><X className="h-3 w-3" /></Button>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Who</span><span className="font-medium">{selectedEntryData.actor.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">What</span><span className="font-medium">{selectedEntryData.action}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">When</span><span className="font-medium">{new Date(selectedEntryData.timestamp).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Resource</span><span className="font-medium">{selectedEntryData.resourceType} #{selectedEntryData.resourceId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Before</span><span className="font-medium">{selectedEntryData.before ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">After</span><span className="font-medium">{selectedEntryData.after ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Instance</span><span className="font-medium">{selectedEntryData.instanceId ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="font-medium">{selectedEntryData.reason ?? "—"}</span></div>
              {selectedEntryData.ip ? <div className="flex justify-between"><span className="text-slate-500">IP</span><span className="font-medium text-xs">{selectedEntryData.ip}</span></div> : null}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
        )}
      </CardBody>
    </Card>
  );
}
