import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState, ErrorState, Spinner } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import {
  GitBranch, FolderDown, Flag, Clock, FileText, Users,
  Shield, Bell, Scale, ScrollText, CheckCircle, Activity,
} from "lucide-react";

type TabId = "overview" | "categories" | "priority" | "lifecycle" | "forms" | "assignment" | "sla" | "escalation" | "notifications" | "templates" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "categories", label: "Categories", icon: FolderDown },
  { id: "priority", label: "Priority", icon: Flag },
  { id: "lifecycle", label: "Lifecycle", icon: GitBranch },
  { id: "forms", label: "Forms & Fields", icon: FileText },
  { id: "assignment", label: "Assignment", icon: Users },
  { id: "sla", label: "SLA", icon: Shield },
  { id: "escalation", label: "Escalation", icon: Scale },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "templates", label: "Templates", icon: ScrollText },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: Clock },
];

const problemCategories = [
  { id: "1", name: "Hardware Failure", incidents: 12 },
  { id: "2", name: "Software Bug", incidents: 28 },
  { id: "3", name: "Configuration Error", incidents: 15 },
  { id: "4", name: "Network Issue", incidents: 9 },
];

export function ProblemConfig() {
  const { instanceId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const permissions = useAppSelector(selectPermissions);
  const [loading, setLoading] = useState(true);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("permissions") || can(permissions, "itsm.permission.read")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problem Configuration"
        description="Configure problem management, root cause analysis, and known errors"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => showError("Export", "Exporting...")}>Export</Button>
            <Button onClick={() => showSuccess("Problem", "Configuration saved")}>Save All</Button>
          </div>
        }
      />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader title="Problem Overview" /><CardBody><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-slate-500">Open Problems</p><p className="text-2xl font-bold">12</p></div><div><p className="text-sm text-slate-500">Known Errors</p><p className="text-2xl font-bold text-brand-600">8</p></div><div><p className="text-sm text-slate-500">Workarounds</p><p className="text-2xl font-bold">24</p></div><div><p className="text-sm text-slate-500">Avg Resolution</p><p className="text-2xl font-bold">2.5 days</p></div></div></CardBody></Card>
            <Card><CardHeader title="Problem Health" /><CardBody>
              {[["Critical", 3, "danger"], ["High", 5, "warning"], ["Medium", 4, "info"], ["Low", 2, "muted"]].map(([label, count, variant]) => (
                <div key={label} className="flex items-center justify-between py-1"><span className="text-sm">{label}</span><Badge variant={variant as any}>{count}</Badge></div>
              ))}
            </CardBody></Card>
          </div>
        ) : activeTab === "categories" ? (
          <DataTable columns={[{ key: "name", header: "Category", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "incidents", header: "Related Incidents", render: (r: { incidents: number }) => <Badge variant="info">{r.incidents}</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={problemCategories} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "forms" ? (
          <div className="p-4"><p className="text-sm text-slate-500">Problem forms and field configuration</p><div className="mt-4 space-y-3"><label className="text-sm font-medium">Problem Form Name<input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" defaultValue="Problem Report" /></label><Button onClick={() => showSuccess("Problem", "Form saved")}>Save Form</Button></div></div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration panel</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
