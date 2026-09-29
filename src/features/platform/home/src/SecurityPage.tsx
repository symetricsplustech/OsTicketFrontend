import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Search, Filter, Plus, RefreshCw,
  AlertTriangle, XCircle, CheckCircle2,
  Clock, Lock, Unlock, Globe, KeyRound,
  User, Activity, FileShield, Settings,
  ChevronRight, MoreVertical, Eye,
  Ban, ShieldAlert, ShieldCheck,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner, Input,
  Label, Select, Field,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  timestamp: string;
  actor: string;
  ip: string;
  resolved: boolean;
}

interface OperatorSession {
  id: string;
  userName: string;
  email: string;
  ip: string;
  device: string;
  mfaVerified: boolean;
  startedAt: string;
  lastActiveAt: string;
  status: "active" | "suspended";
}

interface HighRiskActivity {
  id: string;
  actor: string;
  action: string;
  resource: string;
  riskLevel: "critical" | "high" | "medium";
  timestamp: string;
  status: "flagged" | "reviewed" | "blocked";
}

export function SecurityPage() {
  const [activeTab, setActiveTab] = useState("settings");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  const securitySettings: SecuritySetting[] = useMemo(() => [
    { id: "SS-1", name: "MFA Enforcement", description: "Require MFA for all privileged operations", enabled: true, category: "Authentication", severity: "critical" },
    { id: "SS-2", name: "Session Timeout", description: "Auto-terminate idle sessions after 30 minutes", enabled: true, category: "Authentication", severity: "high" },
    { id: "SS-3", name: "IP Whitelist", description: "Restrict access to approved IP ranges", enabled: false, category: "Network", severity: "high" },
    { id: "SS-4", name: "Audit Logging", description: "Log all access and permission changes", enabled: true, category: "Compliance", severity: "medium" },
    { id: "SS-5", name: "Password Rotation", description: "Force password rotation every 90 days", enabled: true, category: "Authentication", severity: "medium" },
    { id: "SS-6", name: "Suspicious Activity Detection", description: "Monitor for anomalous login patterns", enabled: true, category: "Detection", severity: "high" },
    { id: "SS-7", name: "API Rate Limiting", description: "Limit API requests per minute per operator", enabled: true, category: "Network", severity: "low" },
    { id: "SS-8", name: "Data Encryption at Rest", description: "Encrypt all stored data", enabled: true, category: "Compliance", severity: "critical" },
  ], []);

  const securityEvents: SecurityEvent[] = useMemo(() => [
    { id: "SE-1", type: "Unauthorized Access Attempt", severity: "critical", description: "Multiple failed login attempts from suspicious IP", timestamp: "2024-01-15T11:00:00Z", actor: "System", ip: "203.0.113.50", resolved: false },
    { id: "SE-2", type: "Permission Escalation", severity: "high", description: "User attempted privilege escalation", timestamp: "2024-01-15T10:30:00Z", actor: "admin@platform.com", ip: "10.0.0.5", resolved: false },
    { id: "SE-3", type: "MFA Bypass Attempt", severity: "critical", description: "MFA verification bypass detected", timestamp: "2024-01-15T09:00:00Z", actor: "System", ip: "192.168.1.100", resolved: true },
    { id: "SE-4", type: "IP Whitelist Violation", severity: "medium", description: "Access from unauthorized IP range", timestamp: "2024-01-14T22:00:00Z", actor: "192.168.1.100", ip: "192.168.1.100", resolved: true },
    { id: "SE-5", type: "Brute Force Detection", severity: "high", description: "Rapid login attempts detected", timestamp: "2024-01-14T18:00:00Z", actor: "System", ip: "203.0.113.75", resolved: true },
  ], []);

  const operatorSessions: OperatorSession[] = useMemo(() => [
    { id: "OS-1", userName: "Super Admin", email: "superadmin@platform.com", ip: "10.0.0.1", device: "Chrome / macOS", mfaVerified: true, startedAt: "2024-01-15T08:00:00Z", lastActiveAt: "2024-01-15T11:30:00Z", status: "active" },
    { id: "OS-2", userName: "Ops Manager", email: "ops@platform.com", ip: "10.0.0.2", device: "Firefox / Windows", mfaVerified: true, startedAt: "2024-01-15T09:00:00Z", lastActiveAt: "2024-01-15T11:00:00Z", status: "active" },
    { id: "OS-3", userName: "Security Lead", email: "security@platform.com", ip: "10.0.0.3", device: "Safari / macOS", mfaVerified: true, startedAt: "2024-01-14T10:00:00Z", lastActiveAt: "2024-01-15T10:30:00Z", status: "active" },
    { id: "OS-4", userName: "Support Agent", email: "support@platform.com", ip: "10.0.0.4", device: "Chrome / Linux", mfaVerified: false, startedAt: "2024-01-15T07:00:00Z", lastActiveAt: "2024-01-15T09:00:00Z", status: "suspended" },
  ], []);

  const highRiskActivities: HighRiskActivity[] = useMemo(() => [
    { id: "HRA-1", actor: "superadmin", action: "Created role", resource: "Admin Role", riskLevel: "critical", timestamp: "2024-01-15T11:00:00Z", status: "reviewed" },
    { id: "HRA-2", actor: "ops-manager", action: "Modified permissions", resource: "Platform Permissions", riskLevel: "high", timestamp: "2024-01-15T10:30:00Z", status: "flagged" },
    { id: "HRA-3", actor: "security-admin", action: "Reviewed audit log", resource: "Audit Trail", riskLevel: "medium", timestamp: "2024-01-15T09:15:00Z", status: "reviewed" },
    { id: "HRA-4", actor: "unknown", action: "Unauthorized access", resource: "System Settings", riskLevel: "critical", timestamp: "2024-01-15T08:00:00Z", status: "blocked" },
    { id: "HRA-5", actor: "support-agent", action: "Accessed restricted data", resource: "User Records", riskLevel: "high", timestamp: "2024-01-14T22:00:00Z", status: "flagged" },
  ], []);

  const filteredEvents = useMemo(() => {
    if (!searchValue) return securityEvents;
    return securityEvents.filter(
      (e) =>
        e.type.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.actor.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [securityEvents, searchValue]);

  const settingsColumns = [
    { key: "name", header: "Setting", render: (row: SecuritySetting) => <div className="flex items-center gap-3"><span className={cn("grid h-2 w-2 place-items-center rounded-full", row.severity === "critical" ? "bg-red-500" : row.severity === "high" ? "bg-orange-500" : row.severity === "medium" ? "bg-amber-500" : "bg-slate-400")} /><span className="font-medium text-slate-900">{row.name}</span></div> },
    { key: "category", header: "Category", render: (row: SecuritySetting) => <Badge variant="info">{row.category}</Badge> },
    { key: "severity", header: "Severity", render: (row: SecuritySetting) => <Badge variant={row.severity === "critical" ? "danger" : row.severity === "high" ? "warning" : "muted"}>{row.severity}</Badge> },
    { key: "enabled", header: "Status", render: (row: SecuritySetting) => <StatusBadge status={row.enabled ? "active" : "suspended"} /> },
  ];

  const eventColumns = [
    { key: "type", header: "Event", render: (row: SecurityEvent) => <div className="flex items-center gap-2"><div className={cn("grid h-2 w-2 place-items-center rounded-full", row.severity === "critical" ? "bg-red-500" : row.severity === "high" ? "bg-orange-500" : row.severity === "medium" ? "bg-amber-500" : "bg-slate-400")} /><span className="font-medium text-slate-900">{row.type}</span></div> },
    { key: "actor", header: "Actor", render: (row: SecurityEvent) => <span className="text-sm text-slate-600">{row.actor}</span> },
    { key: "ip", header: "IP", render: (row: SecurityEvent) => <code className="font-mono text-xs text-slate-600">{row.ip}</code> },
    { key: "resolved", header: "Status", render: (row: SecurityEvent) => <Badge variant={row.resolved ? "success" : "warning"}>{row.resolved ? "Resolved" : "Open"}</Badge> },
    { key: "timestamp", header: "Time", render: (row: SecurityEvent) => <span className="text-sm text-slate-500">{formatDateTime(row.timestamp)}</span> },
  ];

  const sessionColumns = [
    { key: "userName", header: "User", render: (row: OperatorSession) => <div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700"><span className="text-xs font-bold">{row.userName.charAt(0)}</span></div><span className="font-medium text-slate-900">{row.userName}</span></div> },
    { key: "device", header: "Device", render: (row: OperatorSession) => <span className="text-sm text-slate-600">{row.device}</span> },
    { key: "mfaVerified", header: "MFA", render: (row: OperatorSession) => row.mfaVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" /> },
    { key: "lastActiveAt", header: "Last Active", render: (row: OperatorSession) => <span className="text-sm text-slate-500">{formatDateTime(row.lastActiveAt)}</span> },
    { key: "status", header: "Status", render: (row: OperatorSession) => <StatusBadge status={row.status} /> },
  ];

  const riskColumns = [
    { key: "actor", header: "Actor", render: (row: HighRiskActivity) => <span className="font-medium text-slate-900">{row.actor}</span> },
    { key: "action", header: "Action", render: (row: HighRiskActivity) => <span className="text-sm text-slate-600">{row.action}</span> },
    { key: "resource", header: "Resource", render: (row: HighRiskActivity) => <code className="font-mono text-xs text-slate-600">{row.resource}</code> },
    { key: "riskLevel", header: "Risk", render: (row: HighRiskActivity) => <Badge variant={row.riskLevel === "critical" ? "danger" : row.riskLevel === "high" ? "warning" : "info"}>{row.riskLevel}</Badge> },
    { key: "status", header: "Status", render: (row: HighRiskActivity) => <Badge variant={row.status === "blocked" ? "danger" : row.status === "reviewed" ? "success" : "warning"}>{row.status}</Badge> },
    { key: "timestamp", header: "Time", render: (row: HighRiskActivity) => <span className="text-sm text-slate-500">{formatDateTime(row.timestamp)}</span> },
  ];

  const openEvents = securityEvents.filter((e) => !e.resolved).length;
  const criticalEvents = securityEvents.filter((e) => e.severity === "critical").length;
  const blockedActivities = highRiskActivities.filter((a) => a.status === "blocked").length;

  return (
    <div>
      <PageHeader
        title="Platform Security"
        description="Global security settings, events, operator sessions, and risk monitoring"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Security</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            <PermissionGate permissions={["platform.admin", "*"]}>
              <Button size="sm"><Settings className="h-4 w-4" /> Configure</Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Security Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Events", value: openEvents.toString(), desc: "Unresolved security events", icon: <AlertTriangle className="h-5 w-5" />, color: "bg-red-50 text-red-700" },
          { label: "Critical Alerts", value: criticalEvents.toString(), desc: "Requires immediate attention", icon: <ShieldAlert className="h-5 w-5" />, color: "bg-red-100 text-red-700" },
          { label: "Blocked Activities", value: blockedActivities.toString(), desc: "High-risk actions blocked", icon: <Ban className="h-5 w-5" />, color: "bg-amber-50 text-amber-700" },
          { label: "Active Sessions", value: `${operatorSessions.filter((s) => s.status === "active").length} secure`, desc: "MFA verified", icon: <ShieldCheck className="h-5 w-5" />, color: "bg-emerald-50 text-emerald-700" },
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

      <Tabs
        tabs={[
          { id: "settings", label: "Global Settings", icon: <Settings className="h-3.5 w-3.5" /> },
          { id: "events", label: `Security Events (${openEvents})`, icon: <Activity className="h-3.5 w-3.5" /> },
          { id: "sessions", label: "Operator Sessions", icon: <User className="h-3.5 w-3.5" /> },
          { id: "risk", label: "High-Risk Activity", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "settings" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{criticalEvents} critical</Badge>
                  <Badge variant="info">{securitySettings.length} settings</Badge>
                </div>
                <PermissionGate permissions={["platform.admin", "*"]}>
                  <Button size="sm"><Plus className="h-4 w-4" /> Add Setting</Button>
                </PermissionGate>
              </div>
              <div className="space-y-2">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-brand-400 transition-colors">
                    <div className="flex items-center gap-4">
                      <button onClick={() => {
                        const updated = securitySettings.map((s) => s.id === setting.id ? { ...s, enabled: !s.enabled } : s);
                        toast.success(`${setting.name} ${setting.enabled ? "disabled" : "enabled"}`);
                      }} className="focus-ring">
                        {setting.enabled ? <ShieldCheck className="h-6 w-6 text-brand-600" /> : <Shield className="h-6 w-6 text-slate-400" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{setting.name}</p>
                          <Badge variant={setting.severity === "critical" ? "danger" : setting.severity === "high" ? "warning" : "muted"}>{setting.severity}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{setting.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{setting.category}</Badge>
                      <StatusBadge status={setting.enabled ? "active" : "suspended"} />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "events" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search security events…" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="pl-8" />
                </div>
                <PermissionGate permissions={["platform.admin", "*"]}>
                  <Button variant="outline" size="sm">Export</Button>
                </PermissionGate>
              </div>
              <div className="space-y-2">
                {filteredEvents.map((event) => (
                  <div key={event.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    event.severity === "critical" ? "border-red-200 bg-red-50/30" : event.severity === "high" ? "border-orange-200 bg-orange-50/30" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg",
                        event.severity === "critical" ? "bg-red-100 text-red-700" : event.severity === "high" ? "bg-orange-100 text-orange-700" : event.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {event.severity === "critical" ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{event.type}</p>
                          {!event.resolved && <Badge variant="danger">Open</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{event.actor} · {event.ip} · {formatDateTime(event.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.resolved ? (
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>
                      ) : (
                        <PermissionGate permissions={["platform.admin", "*"]}>
                          <Button size="sm" variant="outline">Resolve</Button>
                        </PermissionGate>
                      )}
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
                  <Badge variant="success">{operatorSessions.filter((s) => s.mfaVerified).length} MFA verified</Badge>
                  <Badge variant="danger">{operatorSessions.filter((s) => !s.mfaVerified).length} no MFA</Badge>
                </div>
                <PermissionGate permissions={["platform.admin", "*"]}>
                  <Button variant="outline" size="sm"><Ban className="h-3 w-3" /> Suspend Inactive</Button>
                </PermissionGate>
              </div>
              <div className="space-y-3">
                {operatorSessions.map((session) => (
                  <div key={session.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    !session.mfaVerified ? "border-red-200 bg-red-50/30" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn("grid h-10 w-10 place-items-center rounded-full", session.mfaVerified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        <span className="text-xs font-bold">{session.userName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{session.userName}</p>
                        <p className="text-xs text-slate-500">{session.email}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{session.ip} · {session.device}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-slate-500">
                        <p>Last active: {formatDateTime(session.lastActiveAt)}</p>
                        <p>Since: {formatDateTime(session.startedAt)}</p>
                      </div>
                      {session.mfaVerified ? (
                        <Badge variant="success"><Unlock className="h-3 w-3 mr-1" /> MFA</Badge>
                      ) : (
                        <Badge variant="danger"><Lock className="h-3 w-3 mr-1" /> No MFA</Badge>
                      )}
                      <StatusBadge status={session.status} />
                      <PermissionGate permissions={["platform.admin", "*"]}>
                        <Button variant="outline" size="sm" onClick={() => toast.success(`Session ${session.id} terminated`)}>Terminate</Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "risk" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center gap-3">
                <Badge variant="danger">{blockedActivities} blocked</Badge>
                <Badge variant="warning">{highRiskActivities.filter((a) => a.status === "flagged").length} flagged</Badge>
              </div>
              <div className="space-y-2">
                {highRiskActivities.map((activity) => (
                  <div key={activity.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    activity.riskLevel === "critical" ? "border-red-200 bg-red-50/30" : activity.riskLevel === "high" ? "border-orange-200 bg-orange-50/30" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg",
                        activity.riskLevel === "critical" ? "bg-red-100 text-red-700" : activity.riskLevel === "high" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                      )}>
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
                          <Badge variant={activity.riskLevel === "critical" ? "danger" : activity.riskLevel === "high" ? "warning" : "info"}>{activity.riskLevel}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{activity.actor} · {activity.resource}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.status === "blocked" ? "danger" : activity.status === "reviewed" ? "success" : "warning"}>{activity.status}</Badge>
                      <PermissionGate permissions={["platform.admin", "*"]}>
                        <Button variant="outline" size="sm" onClick={() => toast.success(`Activity ${activity.id} reviewed`)}>Review</Button>
                      </PermissionGate>
                    </div>
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

import { toast } from "react-hot-toast";
import { Settings, Plus, RefreshCw, ShieldCheck, ShieldAlert, Ban, Lock, Unlock, CheckCircle2, XCircle } from "lucide-react";
