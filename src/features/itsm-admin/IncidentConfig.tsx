import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { DynamicFormRenderer } from "@shared/components/DynamicFormRenderer";
import { PermissionGate } from "@shared/components/PermissionGate";
import { EmptyState, ErrorState, Spinner, PageLoader } from "@shared/components/ui";
import { Input, Select, Label, Textarea } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { useDebounce } from "@shared/hooks/useDebounce";
import {
  Clock, FolderDown, Flag, GitBranch, FileText, Shield,
  Bell, Zap, Settings, Users, Scale, ScrollText,
  CheckCircle, Activity,
} from "lucide-react";
import type { FieldConfig } from "@shared/components/DynamicFormRenderer";

type TabId = "overview" | "categories" | "priority" | "lifecycle" | "forms" | "assignment" | "sla" | "escalation" | "notifications" | "templates" | "major-incident" | "permissions" | "audit";

const allTabs: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "categories", label: "Categories", icon: FolderDown },
  { id: "priority", label: "Priority", icon: Flag },
  { id: "lifecycle", label: "Lifecycle", icon: GitBranch },
  { id: "forms", label: "Forms & Fields", icon: FileText },
  { id: "assignment", label: "Assignment", icon: Users },
  { id: "sla", label: "SLA", icon: Shield },
  { id: "escalation", label: "Escalation", icon: Scale },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "templates", label: "Templates", icon: ScrollText },
  { id: "major-incident", label: "Major Incident", icon: Activity },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: Clock },
];

const mockCategories = [
  { id: "1", name: "Infrastructure", count: 45 },
  { id: "2", name: "Application", count: 32 },
  { id: "3", name: "Network", count: 28 },
  { id: "4", name: "Security", count: 19 },
  { id: "5", name: "Hardware", count: 12 },
];

const mockPriorities = [
  { id: "1", name: "Critical", color: "danger", sla: "1h" },
  { id: "2", name: "High", color: "warning", sla: "4h" },
  { id: "3", name: "Medium", color: "info", sla: "24h" },
  { id: "4", name: "Low", color: "muted", sla: "72h" },
];

export function IncidentConfig() {
  const { instanceId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const permissions = useAppSelector(selectPermissions);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as TabId);
  }, []);

  const handleSave = useCallback((data: Record<string, unknown>) => {
    showSuccess("Incident Configuration", "Configuration saved successfully");
  }, []);

  const visibleTabs = useMemo(
    () => allTabs.filter((t) => {
      if (t.id === "permissions") return can(permissions, "itsm.permission.read");
      return true;
    }),
    [permissions]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader title="Incident Overview" description="Total incidents and trends" />
                <CardBody>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-slate-500">Total Incidents</p><p className="text-2xl font-bold">1,247</p></div>
                    <div><p className="text-sm text-slate-500">Open</p><p className="text-2xl font-bold text-brand-600">89</p></div>
                    <div><p className="text-sm text-slate-500">Resolved (30d)</p><p className="text-2xl font-bold">1,102</p></div>
                    <div><p className="text-sm text-slate-500">Avg Resolution</p><p className="text-2xl font-bold">4.2h</p></div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Quick Configuration" />
                <CardBody>
                  <div className="space-y-3">
                    <div><Label>Default Category</Label><Select><option>Infrastructure</option><option>Application</option></Select></div>
                    <div><Label>Default Priority</Label><Select><option>Medium</option><option>High</option><option>Critical</option></Select></div>
                    <div><Label>Default Impact</Label><Select><option>Low</option><option>Medium</option><option>High</option></Select></div>
                  </div>
                  <Button className="mt-4" onClick={() => handleSave({})}>Save Configuration</Button>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      case "categories":
        return (
          <DataTable
            columns={[
              { key: "name", header: "Category", render: (row: { name: string }) => <span className="font-medium">{row.name}</span> },
              { key: "count", header: "Incidents", render: (row: { count: number }) => <Badge variant="info">{row.count}</Badge> },
              { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> },
            ]}
            rows={mockCategories}
            rowKey={(row) => row.id}
            searchValue={debouncedSearch}
            onSearchChange={setSearchValue}
            page={1}
            totalPages={1}
            loading={loading}
          />
        );
      case "priority":
        return (
          <div className="space-y-4">
            {mockPriorities.map((p) => (
              <Card key={p.id}>
                <CardBody className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={p.color as any}>{p.name}</Badge>
                    <span className="text-sm text-slate-500">SLA: {p.sla}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        );
      case "lifecycle":
        return (
          <Card>
            <CardHeader title="Lifecycle States" description="Configure incident state transitions" />
            <CardBody>
              <div className="space-y-3">
                {["New", "In Progress", "On Hold", "Resolved", "Closed"].map((state, i) => (
                  <div key={state} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    <Badge variant={i === 0 ? "warning" : i === 3 ? "success" : "info"}>{state}</Badge>
                    {i < 4 && <span className="text-slate-400">→</span>}
                    {i < 4 && <Button variant="outline" size="sm">Add Transition</Button>}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        );
      case "forms":
        return (
          <DynamicFormRenderer
            fields={[
              { name: "name", label: "Form Name", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "category", label: "Category", type: "select", options: [{ value: "incident", label: "Incident" }, { value: "problem", label: "Problem" }] },
              { name: "active", label: "Active", type: "checkbox" },
            ]}
            values={{}}
            onChange={() => {}}
            onSubmit={() => {}}
            submitLabel="Save"
          />
        );
      case "assignment":
        return (
          <Card>
            <CardHeader title="Assignment Rules" description="Configure how incidents are assigned to teams" />
            <CardBody>
              <div className="space-y-4">
                <div><Label>Default Assignment Group</Label><Select><option>IT Support</option><option>Engineering</option></Select></div>
                <div><Label>Assignment Method</Label><Select><option>Round Robin</option><option>Skill-Based</option><option>Load Balance</option></Select></div>
                <div><Label>Escalation Timeout (minutes)</Label><Input type="number" defaultValue="30" /></div>
                <Button onClick={() => showSuccess("Assignment", "Assignment rules saved")}>Save Rules</Button>
              </div>
            </CardBody>
          </Card>
        );
      case "sla":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader title="SLA Targets" />
              <CardBody>
                {[
                  { name: "Critical Response", value: "1 hour", target: "1h" },
                  { name: "Critical Resolution", value: "4 hours", target: "4h" },
                  { name: "High Resolution", value: "24 hours", target: "24h" },
                ].map((sla) => (
                  <div key={sla.name} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">{sla.name}</span>
                    <Badge variant="success">{sla.value}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        );
      case "escalation":
        return (
          <Card>
            <CardHeader title="Escalation Configuration" description="Define escalation policies and timelines" />
            <CardBody>
              <div className="space-y-4">
                <div><Label>First Escalation (minutes)</Label><Input type="number" defaultValue="15" /></div>
                <div><Label>Second Escalation (minutes)</Label><Input type="number" defaultValue="30" /></div>
                <div><Label>Final Escalation</Label><Input type="number" defaultValue="60" /></div>
                <div><Label>Escalation Manager</Label><Select><option>IT Manager</option><option>Service Desk Lead</option></Select></div>
                <Button onClick={() => showSuccess("Escalation", "Escalation policy saved")}>Save Policy</Button>
              </div>
            </CardBody>
          </Card>
        );
      case "notifications":
        return (
          <Card>
            <CardHeader title="Notification Settings" description="Configure incident notification rules" />
            <CardBody>
              <div className="space-y-4">
                {[
                  { label: "On Incident Creation", checked: true },
                  { label: "On Status Change", checked: true },
                  { label: "On Priority Change", checked: false },
                  { label: "On Assignment", checked: true },
                ].map((item) => (
                  <label key={item.label} className="flex items-center gap-3">
                    <input type="checkbox" checked={item.checked} className="h-4 w-4 rounded" />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
              <Button className="mt-4" onClick={() => showSuccess("Notifications", "Settings saved")}>Save Notifications</Button>
            </CardBody>
          </Card>
        );
      case "templates":
        return (
          <Card>
            <CardHeader title="Email Templates" description="Manage incident notification templates" />
            <CardBody>
              <div className="space-y-3">
                {["Incident Created", "Status Updated", "Escalation Triggered"].map((t) => (
                  <div key={t} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium">{t}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4" onClick={() => showSuccess("Templates", "Template updated")}>Add Template</Button>
            </CardBody>
          </Card>
        );
      case "major-incident":
        return (
          <Card>
            <CardHeader title="Major Incident Management" description="Configure major incident declaration and response" />
            <CardBody>
              <div className="space-y-4">
                <div><Label>Auto-Declaration Threshold</Label><Select><option>Severity 1</option><option>P1</option></Select></div>
                <div><Label>War Room Template</Label><Textarea defaultValue="Major Incident War Room" rows={3} /></div>
                <div><Label>Communication Channel</Label><Select><option>Slack</option><option>Teams</option><option>Email</option></Select></div>
                <Button onClick={() => showSuccess("Major Incident", "Configuration saved")}>Save</Button>
              </div>
            </CardBody>
          </Card>
        );
      case "permissions":
        return (
          <PermissionGate permissions={["itsm.permission.read"]} fallback={<EmptyState title="No access" description="You don't have permission to view this" />}>
            <Card>
              <CardHeader title="Incident Permissions" />
              <CardBody>
                <div className="space-y-2">
                  {["itsm.incident.create", "itsm.incident.read", "itsm.incident.update", "itsm.incident.delete", "itsm.incident.escalate"].map((perm) => (
                    <div key={perm} className="flex items-center justify-between py-2 border-b">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">{perm}</code>
                      <Badge variant="success">Allowed</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </PermissionGate>
        );
      case "audit":
        return (
          <Card>
            <CardHeader title="Audit Log" description="Incident configuration change history" />
            <CardBody>
              <div className="space-y-2">
                {[
                  { action: "Updated SLA policy", actor: "Admin", time: "2 hours ago" },
                  { action: "Created category", actor: "System", time: "1 day ago" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b">
                    <div><span className="text-sm font-medium">{entry.action}</span><br /><span className="text-xs text-slate-500">by {entry.actor}</span></div>
                    <span className="text-xs text-slate-400">{entry.time}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        );
      default:
        return <EmptyState title="Select a tab" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Configuration"
        description="Configure incident types, categories, priorities, and workflows"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => showInfo("Export", "Exporting configuration...")}>Export</Button>
            <Button onClick={() => showSuccess("Incident", "Configuration saved")}>Save All</Button>
          </div>
        }
      />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={handleTabChange} />
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
}
