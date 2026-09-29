import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Settings, Search, Filter, Plus, ToggleLeft,
  ToggleRight, CheckCircle2, XCircle, Globe,
  Package, Rocket, Target, Users, Clock,
  ChevronRight, RefreshCw, MoreVertical,
  Zap, Shield, Activity,
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

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: string;
  rolloutPercentage: number;
  targetAudience: string;
  lastModified: string;
  modifiedBy: string;
  category: string;
}

interface ModuleAvailability {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  version: string;
  dependencies: string[];
  status: "available" | "beta" | "deprecated" | "unavailable";
}

interface RolloutTarget {
  id: string;
  featureName: string;
  targetType: "region" | "instance" | "role" | "percentage";
  targetValue: string;
  percentage: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "completed";
}

export function FeaturesPage() {
  const dispatch = useAppDispatch();
  const permissions = useAppSelector(selectPermissions);
  const [activeTab, setActiveTab] = useState("flags");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    { id: "F-1", name: "Dark Mode", key: "ui.dark_mode", description: "Enable dark mode theme across the platform", enabled: true, environment: "production", rolloutPercentage: 100, targetAudience: "All users", lastModified: "2024-01-10T00:00:00Z", modifiedBy: "superadmin", category: "UI" },
    { id: "F-2", name: "Advanced Analytics", key: "analytics.advanced", description: "Enable advanced analytics dashboards", enabled: true, environment: "production", rolloutPercentage: 75, targetAudience: "Enterprise plan", lastModified: "2024-01-12T00:00:00Z", modifiedBy: "ops-manager", category: "Analytics" },
    { id: "F-3", name: "AI Assistance", key: "ai.assistance", description: "Enable AI-powered suggestions and auto-completion", enabled: false, environment: "staging", rolloutPercentage: 25, targetAudience: "Beta testers", lastModified: "2024-01-14T00:00:00Z", modifiedBy: "superadmin", category: "AI" },
    { id: "F-4", name: "SSO Integration", key: "auth.sso", description: "Enable single sign-on with external providers", enabled: true, environment: "production", rolloutPercentage: 50, targetAudience: "Admin roles", lastModified: "2024-01-08T00:00:00Z", modifiedBy: "security-lead", category: "Auth" },
    { id: "F-5", name: "Custom Domains", key: "auth.custom_domains", description: "Allow custom domain configuration for instances", enabled: true, environment: "production", rolloutPercentage: 100, targetAudience: "All instances", lastModified: "2024-01-05T00:00:00Z", modifiedBy: "superadmin", category: "Auth" },
  ]);

  const [modules, setModules] = useState<ModuleAvailability[]>([
    { id: "M-1", name: "Incident Management", category: "Core", enabled: true, version: "3.2.1", dependencies: [], status: "available" },
    { id: "M-2", name: "Problem Management", category: "Core", enabled: true, version: "2.8.0", dependencies: ["Incident Management"], status: "available" },
    { id: "M-3", name: "Change Management", category: "Core", enabled: true, version: "2.5.0", dependencies: ["Incident Management"], status: "available" },
    { id: "M-4", name: "Service Catalog", category: "Premium", enabled: true, version: "1.9.3", dependencies: ["Incident Management"], status: "available" },
    { id: "M-5", name: "Knowledge Base", category: "Premium", enabled: false, version: "1.5.0", dependencies: ["Incident Management"], status: "beta" },
    { id: "M-6", name: "Asset & CMDB", category: "Enterprise", enabled: false, version: "1.2.0", dependencies: ["Incident Management", "Service Catalog"], status: "unavailable" },
    { id: "M-7", name: "Reporting & Analytics", category: "Premium", enabled: true, version: "2.1.0", dependencies: ["Incident Management"], status: "available" },
    { id: "M-8", name: "Automation Engine", category: "Enterprise", enabled: false, version: "1.0.0-beta", dependencies: ["Incident Management", "Service Catalog"], status: "beta" },
  ]);

  const [rolloutTargets, setRolloutTargets] = useState<RolloutTarget[]>([
    { id: "R-1", featureName: "Advanced Analytics", targetType: "percentage", targetValue: "75%", percentage: 75, startDate: "2024-01-01", endDate: "2024-03-31", status: "active" },
    { id: "R-2", featureName: "AI Assistance", targetType: "role", targetValue: "Beta testers", percentage: 25, startDate: "2024-01-15", endDate: "2024-04-15", status: "scheduled" },
    { id: "R-3", featureName: "SSO Integration", targetType: "region", targetValue: "US East, EU West", percentage: 50, startDate: "2024-01-10", endDate: "2024-02-10", status: "active" },
    { id: "R-4", featureName: "Dark Mode", targetType: "percentage", targetValue: "100%", percentage: 100, startDate: "2023-12-01", endDate: "2024-12-31", status: "completed" },
  ]);

  const filteredFlags = useMemo(() => {
    if (!searchValue) return featureFlags;
    return featureFlags.filter(
      (f) =>
        f.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        f.key.toLowerCase().includes(searchValue.toLowerCase()) ||
        f.category.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [featureFlags, searchValue]);

  const handleToggleFlag = (flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) =>
        f.id === flagId ? { ...f, enabled: !f.enabled } : f
      )
    );
    const flag = featureFlags.find((f) => f.id === flagId);
    if (flag) {
      toast.success(`${flag.name} ${flag.enabled ? "disabled" : "enabled"}`);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      )
    );
    const mod = modules.find((m) => m.id === moduleId);
    if (mod) {
      toast.success(`${mod.name} ${mod.enabled ? "disabled" : "enabled"}`);
    }
  };

  const handleUpdateRollout = (targetId: string, percentage: number) => {
    setRolloutTargets((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, percentage } : r))
    );
    toast.success("Rollout target updated");
  };

  const stats = useMemo(() => ({
    totalFlags: featureFlags.length,
    enabledFlags: featureFlags.filter((f) => f.enabled).length,
    totalModules: modules.length,
    enabledModules: modules.filter((m) => m.enabled).length,
    activeRollouts: rolloutTargets.filter((r) => r.status === "active").length,
  }), [featureFlags, modules, rolloutTargets]);

  if (loading) return <PageLoader label="Loading features…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Platform Features"
        description="Feature flags, module availability, and rollout targeting"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Features</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Sync</Button>
            <PermissionGate permissions={["platform.admin", "*"]}>
              <Button size="sm"><Plus className="h-4 w-4" /> Add Flag</Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Feature Flags", value: `${stats.enabledFlags}/${stats.totalFlags}`, desc: "Enabled out of total", icon: <Zap className="h-5 w-5" />, color: "bg-brand-50 text-brand-700" },
          { label: "Modules", value: `${stats.enabledModules}/${stats.totalModules}`, desc: "Available out of total", icon: <Package className="h-5 w-5" />, color: "bg-emerald-50 text-emerald-700" },
          { label: "Active Rollouts", value: stats.activeRollouts.toString(), desc: "In-progress deployments", icon: <Rocket className="h-5 w-5" />, color: "bg-sky-50 text-sky-700" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className={cn("grid h-12 w-12 place-items-center rounded-xl", stat.color)}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "flags", label: "Feature Flags", icon: <ToggleRight className="h-3.5 w-3.5" /> },
          { id: "modules", label: "Module Availability", icon: <Package className="h-3.5 w-3.5" /> },
          { id: "rollouts", label: "Rollout Targeting", icon: <Target className="h-3.5 w-3.5" /> },
          { id: "settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "flags" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search feature flags…"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{stats.enabledFlags} enabled</Badge>
                  <Badge variant="muted">{stats.totalFlags - stats.enabledFlags} disabled</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {filteredFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-brand-400 transition-colors">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleToggleFlag(flag.id)} className="focus-ring">
                        {flag.enabled ? (
                          <ToggleRight className="h-8 w-8 text-brand-600" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{flag.name}</p>
                          <Badge variant={flag.environment === "production" ? "success" : "info"}>{flag.environment}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 font-mono">{flag.key}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{flag.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="text-right">
                        <p>Rollout: <strong>{flag.rolloutPercentage}%</strong></p>
                        <p className="mt-0.5">{flag.category}</p>
                      </div>
                      <div className="text-right">
                        <p>By: {flag.modifiedBy}</p>
                        <p className="mt-0.5">{formatDateTime(flag.lastModified)}</p>
                      </div>
                      <PermissionGate permissions={["platform.admin", "*"]}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "modules" && (
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">{stats.enabledModules} active</Badge>
                  <Badge variant="info">{stats.totalModules} total</Badge>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {modules.map((mod) => (
                  <div key={mod.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    mod.enabled ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg",
                        mod.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{mod.name}</p>
                        <p className="text-xs text-slate-500">v{mod.version} · {mod.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={mod.status === "available" ? "success" : mod.status === "beta" ? "warning" : mod.status === "deprecated" ? "info" : "danger"}>{mod.status}</Badge>
                      <PermissionGate permissions={["platform.admin", "*"]}>
                        <button onClick={() => handleToggleModule(mod.id)} className="focus-ring">
                          {mod.enabled ? <ToggleRight className="h-6 w-6 text-brand-600" /> : <ToggleLeft className="h-6 w-6 text-slate-400" />}
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "rollouts" && (
          <Card>
            <CardBody>
              <div className="space-y-4">
                {rolloutTargets.map((target) => (
                  <div key={target.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{target.featureName}</p>
                          <StatusBadge status={target.status === "active" ? "active" : target.status === "scheduled" ? "invited" : "closed"} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Target: {target.targetType} ({target.targetValue}) · {target.percentage}%
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32">
                          <div className="h-2 w-full rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-brand-600 transition-all"
                              style={{ width: `${target.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{target.percentage}%</span>
                        <PermissionGate permissions={["platform.admin", "*"]}>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={target.percentage}
                            onChange={(e) => handleUpdateRollout(target.id, Number(e.target.value))}
                            className="w-20"
                          />
                        </PermissionGate>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span>Start: {target.startDate}</span>
                      <span>End: {target.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardHeader title="Feature Settings" description="Configure global feature defaults" />
            <CardBody>
              <div className="space-y-4">
                {[
                  { label: "Default Environment", value: "production", type: "select", options: ["production", "staging", "development"] },
                  { label: "Default Rollout Percentage", value: "10", type: "number" },
                  { label: "Auto-Promote Beta Flags", value: true, type: "toggle" },
                  { label: "Notification Channel", value: "email", type: "select", options: ["email", "slack", "webhook"] },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{setting.label}</p>
                      <p className="text-xs text-slate-500">Current: {String(setting.value)}</p>
                    </div>
                    {setting.type === "select" ? (
                      <Select defaultValue={String(setting.value)} className="w-40">
                        {(setting as { options: string[] }).options.map((opt) => <option key={opt}>{opt}</option>)}
                      </Select>
                    ) : setting.type === "toggle" ? (
                      <button onClick={() => toast.success("Setting toggled")} className="focus-ring">
                        <ToggleRight className="h-6 w-6 text-brand-600" />
                      </button>
                    ) : (
                      <Input type="number" defaultValue={String(setting.value)} className="w-24" />
                    )}
                  </div>
                ))}
                <div className="pt-4">
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

import { toast } from "react-hot-toast";
import { ToggleRight, ToggleLeft, Package, Rocket, Target, Zap, Settings } from "lucide-react";
