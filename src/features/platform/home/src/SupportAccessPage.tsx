import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Search, Filter, Plus, Clock,
  CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, Globe, KeyRound, History,
  FileText, Settings, Users, Activity,
  MoreVertical, RefreshCw,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner, Input,
  Tabs,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime, formatDate } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";
import { PermissionGate } from "@shared/components/PermissionGate";
import { ActivityStream } from "@shared/components/ActivityStream";

interface SupportRequest {
  id: string;
  requester: string;
  instanceId: string;
  type: "access" | "mfa" | "permission" | "audit";
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "approved" | "denied" | "in_progress";
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  ip: string;
  device: string;
  mfaVerified: boolean;
  startedAt: string;
  lastActiveAt: string;
  status: "active" | "idle";
}

interface AccessHistoryEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  outcome: "success" | "failure";
}

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: string;
}

export function SupportAccessPage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchValue, setSearchValue] = useState("");

  const supportRequests: SupportRequest[] = useMemo(() => [
    { id: "SR-001", requester: "alice@platform.com", instanceId: "inst-1", type: "access", priority: "high", status: "pending", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", description: "Requesting elevated access to staging instance" },
    { id: "SR-002", requester: "bob@platform.com", instanceId: "inst-2", type: "mfa", priority: "critical", status: "in_progress", createdAt: "2024-01-15T09:00:00Z", updatedAt: "2024-01-15T09:30:00Z", description: "MFA reset required - lost device" },
    { id: "SR-003", requester: "carol@platform.com", instanceId: "inst-1", type: "permission", priority: "medium", status: "approved", createdAt: "2024-01-14T14:00:00Z", updatedAt: "2024-01-15T08:00:00Z", description: "Requesting read-only access to audit logs" },
    { id: "SR-004", requester: "david@platform.com", instanceId: "inst-3", type: "audit", priority: "low", status: "pending", createdAt: "2024-01-14T11:00:00Z", updatedAt: "2024-01-14T11:00:00Z", description: "Request audit trail export for compliance" },
  ], []);

  const activeSessions: ActiveSession[] = useMemo(() => [
    { id: "S-1", userId: "1", userName: "Super Admin", ip: "10.0.0.1", device: "Chrome / macOS", mfaVerified: true, startedAt: "2024-01-15T08:00:00Z", lastActiveAt: "2024-01-15T11:30:00Z", status: "active" },
    { id: "S-2", userId: "2", userName: "Ops Manager", ip: "10.0.0.2", device: "Firefox / Windows", mfaVerified: true, startedAt: "2024-01-15T09:00:00Z", lastActiveAt: "2024-01-15T11:00:00Z", status: "active" },
    { id: "S-3", userId: "3", userName: "Security Lead", ip: "10.0.0.3", device: "Safari / macOS", mfaVerified: true, startedAt: "2024-01-14T10:00:00Z", lastActiveAt: "2024-01-15T10:30:00Z", status: "idle" },
    { id: "S-4", userId: "4", userName: "Support Agent", ip: "10.0.0.4", device: "Chrome / Linux", mfaVerified: false, startedAt: "2024-01-15T07:00:00Z", lastActiveAt: "2024-01-15T09:00:00Z", status: "active" },
  ], []);

  const accessHistory: AccessHistoryEntry[] = useMemo(() => [
    { id: "H-1", actor: "Super Admin", action: "Granted access", resource: "inst-1", timestamp: "2024-01-15T10:00:00Z", outcome: "success" },
    { id: "H-2", actor: "Ops Manager", action: "Denied access", resource: "inst-3", timestamp: "2024-01-15T09:30:00Z", outcome: "failure" },
    { id: "H-3", actor: "Security Lead", action: "Reviewed session", resource: "S-1", timestamp: "2024-01-15T09:00:00Z", outcome: "success" },
    { id: "H-4", actor: "System", action: "Revoked session", resource: "S-5", timestamp: "2024-01-14T22:00:00Z", outcome: "success" },
  ], []);

  const policies: AccessPolicy[] = useMemo(() => [
    { id: "P-1", name: "Session Timeout Policy", description: "Auto-terminate idle sessions after 30 minutes", enabled: true, scope: "All operators" },
    { id: "P-2", name: "MFA Enforcement Policy", description: "Require MFA for all privileged operations", enabled: true, scope: "Admin+ roles" },
    { id: "P-3", name: "IP Whitelist Policy", description: "Restrict access to approved IP ranges", enabled: false, scope: "Platform admin" },
    { id: "P-4", name: "Audit Logging Policy", description: "Log all access and permission changes", enabled: true, scope: "All users" },
    { id: "P-5", name: "Password Rotation Policy", description: "Force password rotation every 90 days", enabled: true, scope: "All users" },
  ], []);

  const requestColumns = [
    { key: "id", header: "ID", render: (row: SupportRequest) => <span className="font-mono text-sm text-brand-700">{row.id}</span> },
    { key: "requester", header: "Requester", render: (row: SupportRequest) => <span className="text-sm text-slate-900">{row.requester}</span> },
    { key: "type", header: "Type", render: (row: SupportRequest) => <Badge variant={row.type === "mfa" ? "danger" : row.type === "critical" ? "warning" : "info"}>{row.type}</Badge> },
    { key: "priority", header: "Priority", render: (row: SupportRequest) => <Badge variant={row.priority === "critical" ? "danger" : row.priority === "high" ? "warning" : "muted"}>{row.priority}</Badge> },
    { key: "status", header: "Status", render: (row: SupportRequest) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Created", render: (row: SupportRequest) => <span className="text-sm text-slate-500">{formatDateTime(row.createdAt)}</span> },
  ];

  const sessionColumns = [
    { key: "userName", header: "User", render: (row: ActiveSession) => <span className="font-medium text-slate-900">{row.userName}</span> },
    { key: "ip", header: "IP Address", render: (row: ActiveSession) => <span className="font-mono text-sm text-slate-600">{row.ip}</span> },
    { key: "device", header: "Device", render: (row: ActiveSession) => <span className="text-sm text-slate-600">{row.device}</span> },
    { key: "mfaVerified", header: "MFA", render: (row: ActiveSession) => row.mfaVerified ? <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</Badge> : <Badge variant="danger"><XCircle className="h-3 w-3 mr-1" /> Not verified</Badge> },
    { key: "status", header: "Status", render: (row: ActiveSession) => <StatusBadge status={row.status === "active" ? "active" : "invited"} /> },
    { key: "lastActiveAt", header: "Last Active", render: (row: ActiveSession) => <span className="text-sm text-slate-500">{formatDateTime(row.lastActiveAt)}</span> },
  ];

  const historyColumns = [
    { key: "actor", header: "Actor", render: (row: AccessHistoryEntry) => <span className="text-sm font-medium text-slate-900">{row.actor}</span> },
    { key: "action", header: "Action", render: (row: AccessHistoryEntry) => <span className="text-sm text-slate-600">{row.action}</span> },
    { key: "resource", header: "Resource", render: (row: AccessHistoryEntry) => <span className="font-mono text-sm text-slate-600">{row.resource}</span> },
    { key: "outcome", header: "Outcome", render: (row: AccessHistoryEntry) => <Badge variant={row.outcome === "success" ? "success" : "danger"}>{row.outcome}</Badge> },
    { key: "timestamp", header: "Time", render: (row: AccessHistoryEntry) => <span className="text-sm text-slate-500">{formatDateTime(row.timestamp)}</span> },
  ];

  const policyColumns = [
    { key: "name", header: "Policy", render: (row: AccessPolicy) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: "description", header: "Description", render: (row: AccessPolicy) => <span className="text-sm text-slate-600">{row.description}</span> },
    { key: "scope", header: "Scope", render: (row: AccessPolicy) => <Badge variant="info">{row.scope}</Badge> },
    { key: "enabled", header: "Status", render: (row: AccessPolicy) => <StatusBadge status={row.enabled ? "active" : "suspended"} /> },
  ];

  const pendingCount = supportRequests.filter((r) => r.status === "pending" || r.status === "in_progress").length;

  return (
    <div>
      <PageHeader
        title="Support Access"
        description="Manage support access requests, active sessions, history, and policies"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Support Access</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permissions={["support.manage", "platform.admin", "*"]}>
              <Button size="sm"><Plus className="h-4 w-4" /> New Request</Button>
            </PermissionGate>
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Refresh</Button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "requests", label: `Requests (${pendingCount})`, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
          { id: "sessions", label: "Active Sessions", icon: <Activity className="h-3.5 w-3.5" /> },
          { id: "history", label: "History", icon: <History className="h-3.5 w-3.5" /> },
          { id: "policies", label: "Policies", icon: <Settings className="h-3.5 w-3.5" /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "requests" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search requests…"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{supportRequests.filter((r) => r.priority === "critical").length} critical</Badge>
                  <Badge variant="warning">{supportRequests.filter((r) => r.status === "pending").length} pending</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {supportRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg",
                        req.priority === "critical" ? "bg-red-100 text-red-700" : req.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {req.type === "mfa" ? <KeyRound className="h-5 w-5" /> : req.type === "access" ? <Globe className="h-5 w-5" /> : req.type === "permission" ? <Shield className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-brand-700">{req.id}</span>
                          <Badge variant={req.priority === "critical" ? "danger" : req.priority === "high" ? "warning" : "muted"}>{req.priority}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-600">{req.description}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{req.requester} · {formatDateTime(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      <PermissionGate permissions={["support.manage", "platform.admin", "*"]}>
                        <div className="flex gap-1">
                          {req.status === "pending" && (
                            <>
                              <Button size="sm" variant="success"><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                              <Button size="sm" variant="danger"><XCircle className="h-3 w-3" /> Deny</Button>
                            </>
                          )}
                          {req.status === "in_progress" && (
                            <Button size="sm"><Clock className="h-3 w-3" /> Resolve</Button>
                          )}
                        </div>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "sessions" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">{activeSessions.filter((s) => s.status === "active" && s.mfaVerified).length} secure</Badge>
                  <Badge variant="danger">{activeSessions.filter((s) => !s.mfaVerified).length} no MFA</Badge>
                </div>
                <PermissionGate permissions={["support.manage", "platform.admin", "*"]}>
                  <Button variant="outline" size="sm"><XCircle className="h-3 w-3" /> Terminate Inactive</Button>
                </PermissionGate>
              </div>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    !session.mfaVerified ? "border-red-200 bg-red-50/50" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "grid h-10 w-10 place-items-center rounded-full",
                        session.mfaVerified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        <span className="text-xs font-bold">{session.userName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{session.userName}</p>
                        <p className="text-xs text-slate-500">{session.ip} · {session.device}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-slate-500">
                        <p>Last active: {formatDateTime(session.lastActiveAt)}</p>
                        <p>Started: {formatDateTime(session.startedAt)}</p>
                      </div>
                      <PermissionGate permissions={["support.manage", "platform.admin", "*"]}>
                        <Button variant="outline" size="sm" onClick={() => toast.success(`Session ${session.id} terminated`)}>Terminate</Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <CardBody>
              <div className="space-y-3">
                {accessHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "grid h-8 w-8 place-items-center rounded-full",
                        entry.outcome === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {entry.outcome === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                        <p className="text-xs text-slate-500">{entry.actor} · {entry.resource}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "policies" && (
          <Card>
            <CardBody>
              <div className="space-y-3">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{policy.name}</p>
                        <StatusBadge status={policy.enabled ? "active" : "suspended"} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{policy.description}</p>
                      <Badge variant="info" className="mt-1">{policy.scope}</Badge>
                    </div>
                    <PermissionGate permissions={["support.manage", "platform.admin", "*"]}>
                      <Button
                        variant={policy.enabled ? "outline" : "primary"}
                        size="sm"
                        onClick={() => toast.success(`${policy.name} ${policy.enabled ? "disabled" : "enabled"}`)}
                      >
                        {policy.enabled ? "Disable" : "Enable"}
                      </Button>
                    </PermissionGate>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

import { CheckCircle2, XCircle, AlertTriangle, Shield, Globe, KeyRound, FileText, History, Settings, Activity, RefreshCw } from "lucide-react";
