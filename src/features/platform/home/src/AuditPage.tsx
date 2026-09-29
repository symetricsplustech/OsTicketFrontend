import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Search, Filter, RefreshCw,
  ChevronRight, Download, Settings,
  Clock, User, FileSearch, Activity,
  MoreVertical, Calendar,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner, Input,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  before?: string;
  after?: string;
  correlationId?: string;
  instanceId?: string;
  ip?: string;
  outcome: "success" | "failure";
}

interface AuditFilter {
  actor?: string;
  action?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilter>({});
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const auditEntries: AuditEntry[] = useMemo(() => [
    { id: "A-1", timestamp: "2024-01-15T11:00:00Z", actor: "superadmin", action: "Created role", resourceType: "Role", resourceId: "role-1", before: undefined, after: "Admin Role created", correlationId: "corr-001", instanceId: "platform", ip: "10.0.0.1", outcome: "success" },
    { id: "A-2", timestamp: "2024-01-15T10:30:00Z", actor: "ops-manager", action: "Modified permissions", resourceType: "Permission", resourceId: "perm-5", before: "tenant.user.read", after: "tenant.user.read, tenant.user.update", correlationId: "corr-002", instanceId: "platform", ip: "10.0.0.2", outcome: "success" },
    { id: "A-3", timestamp: "2024-01-15T09:15:00Z", actor: "security-admin", action: "Reviewed audit log", resourceType: "Audit", resourceId: "audit-100", before: undefined, after: "Export initiated", correlationId: "corr-003", instanceId: "platform", ip: "10.0.0.3", outcome: "success" },
    { id: "A-4", timestamp: "2024-01-15T08:00:00Z", actor: "system", action: "Unauthorized access attempt", resourceType: "Access", resourceId: "access-42", before: undefined, after: "Blocked", correlationId: "corr-004", instanceId: "platform", ip: "203.0.113.50", outcome: "failure" },
    { id: "A-5", timestamp: "2024-01-14T22:00:00Z", actor: "system", action: "Session revoked", resourceType: "Session", resourceId: "sess-99", before: "active", after: "revoked", correlationId: "corr-005", instanceId: "platform", ip: "10.0.0.4", outcome: "success" },
    { id: "A-6", timestamp: "2024-01-14T16:00:00Z", actor: "ops-manager", action: "Updated instance settings", resourceType: "Instance", resourceId: "inst-1", before: "plan: basic", after: "plan: enterprise", correlationId: "corr-006", instanceId: "inst-1", ip: "10.0.0.2", outcome: "success" },
    { id: "A-7", timestamp: "2024-01-14T14:30:00Z", actor: "admin@platform.com", action: "Invited user", resourceType: "User", resourceId: "user-15", before: undefined, after: "Invited bob@platform.com", correlationId: "corr-007", instanceId: "inst-1", ip: "10.0.0.5", outcome: "success" },
    { id: "A-8", timestamp: "2024-01-14T11:00:00Z", actor: "system", action: "Backup completed", resourceType: "Backup", resourceId: "backup-001", before: undefined, after: "Completed successfully", correlationId: "corr-008", instanceId: "platform", ip: "10.0.0.1", outcome: "success" },
  ], []);

  const filteredEntries = useMemo(() => {
    let result = auditEntries;
    if (searchValue) {
      const q = searchValue.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.resourceType.toLowerCase().includes(q) ||
          e.resourceId.toLowerCase().includes(q) ||
          e.correlationId?.toLowerCase().includes(q)
      );
    }
    if (filters.action) {
      result = result.filter((e) => e.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters.resourceType) {
      result = result.filter((e) => e.resourceType.toLowerCase().includes(filters.resourceType!.toLowerCase()));
    }
    return result;
  }, [auditEntries, searchValue, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / 10));
  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredEntries.slice(start, start + 10);
  }, [filteredEntries, page]);

  const successCount = auditEntries.filter((e) => e.outcome === "success").length;
  const failureCount = auditEntries.filter((e) => e.outcome === "failure").length;

  const handleFilter = (newFilters: AuditFilter) => {
    setFilters(newFilters);
    setPage(1);
  };

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (row: AuditEntry) => <span className="text-sm text-slate-500">{formatDateTime(row.timestamp)}</span> },
    { key: "actor", header: "Actor", render: (row: AuditEntry) => <div className="flex items-center gap-2"><div className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-brand-700"><span className="text-[10px] font-bold">{row.actor.charAt(0)}</span></div><span className="text-sm font-medium text-slate-900">{row.actor}</span></div> },
    { key: "action", header: "Action", render: (row: AuditEntry) => <span className="text-sm text-slate-900">{row.action}</span> },
    { key: "resourceType", header: "Resource", render: (row: AuditEntry) => <div><p className="text-sm text-slate-900">{row.resourceType}</p><p className="text-xs text-slate-400 font-mono">#{row.resourceId}</p></div> },
    { key: "outcome", header: "Outcome", render: (row: AuditEntry) => <Badge variant={row.outcome === "success" ? "success" : "danger"}>{row.outcome}</Badge> },
    { key: "correlationId", header: "Correlation", render: (row: AuditEntry) => <span className="font-mono text-xs text-slate-500">{row.correlationId ?? "—"}</span> },
    { key: "ip", header: "IP", render: (row: AuditEntry) => <code className="text-xs text-slate-600">{row.ip ?? "—"}</code> },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Explorer"
        description="Comprehensive audit trail and activity monitoring"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Audit</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            <PermissionGate permissions={["platform.admin", "*"]}>
              <Button size="sm"><Settings className="h-4 w-4" /> Configure</Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Entries", value: auditEntries.length.toString(), desc: "All audit records", icon: <FileSearch className="h-5 w-5" />, color: "bg-brand-50 text-brand-700" },
          { label: "Successful", value: successCount.toString(), desc: "Successful actions", icon: <Activity className="h-5 w-5" />, color: "bg-emerald-50 text-emerald-700" },
          { label: "Failures", value: failureCount.toString(), desc: "Failed actions", icon: <AlertTriangle className="h-5 w-5" />, color: "bg-red-50 text-red-700" },
          { label: "Date Range", value: "Jan 2024", desc: "Current reporting period", icon: <Calendar className="h-5 w-5" />, color: "bg-sky-50 text-sky-700" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-3">
              <div className={cn("grid h-10 w-10 place-items-center rounded-lg", stat.color)}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <AuditExplorer
        entries={paginatedEntries}
        loading={loading}
        onFilter={handleFilter}
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing {paginatedEntries.length} of {filteredEntries.length} entries
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="px-3 py-1 text-xs text-slate-600">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      {/* Filter Panel */}
      <Card className="mt-4">
        <CardHeader title="Filters" description="Refine audit entries by actor, action, or resource type" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Actor">
              <Input placeholder="Filter by actor…" value={filters.actor ?? ""} onChange={(e) => handleFilter({ ...filters, actor: e.target.value || undefined })} />
            </Field>
            <Field label="Action">
              <Select value={filters.action ?? ""} onChange={(e) => handleFilter({ ...filters, action: e.target.value || undefined })}>
                <option value="">All actions</option>
                <option value="Created">Created</option>
                <option value="Modified">Modified</option>
                <option value="Deleted">Deleted</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Accessed">Accessed</option>
              </Select>
            </Field>
            <Field label="Resource Type">
              <Select value={filters.resourceType ?? ""} onChange={(e) => handleFilter({ ...filters, resourceType: e.target.value || undefined })}>
                <option value="">All types</option>
                <option value="Role">Role</option>
                <option value="Permission">Permission</option>
                <option value="Instance">Instance</option>
                <option value="User">User</option>
                <option value="Session">Session</option>
                <option value="Audit">Audit</option>
              </Select>
            </Field>
            <Field label="Date Range">
              <div className="flex gap-2">
                <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => handleFilter({ ...filters, dateFrom: e.target.value || undefined })} />
                <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => handleFilter({ ...filters, dateTo: e.target.value || undefined })} />
              </div>
            </Field>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

import { toast } from "react-hot-toast";
import { AlertTriangle, FileSearch } from "lucide-react";
