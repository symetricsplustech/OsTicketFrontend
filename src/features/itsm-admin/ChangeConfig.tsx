import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { CalendarDays, GitBranch, FileText, Users, Shield, Bell, Scale, ScrollText, CheckCircle, Activity } from "lucide-react";

type TabId = "overview" | "types" | "approval" | "lifecycle" | "forms" | "assignment" | "sla" | "escalation" | "notifications" | "templates" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "types", label: "Change Types", icon: GitBranch },
  { id: "approval", label: "Approval", icon: CheckCircle },
  { id: "lifecycle", label: "Lifecycle", icon: CalendarDays },
  { id: "forms", label: "Forms & Fields", icon: FileText },
  { id: "assignment", label: "Assignment", icon: Users },
  { id: "sla", label: "SLA", icon: Shield },
  { id: "escalation", label: "Escalation", icon: Scale },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "templates", label: "Templates", icon: ScrollText },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: CalendarDays },
];

const changeTypes = [
  { id: "1", name: "Standard", approvals: "None", risk: "Low" },
  { id: "2", name: "Normal", approvals: "Manager", risk: "Medium" },
  { id: "3", name: "Emergency", approvals: "CAB", risk: "High" },
];

export function ChangeConfig() {
  const { instanceId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const permissions = useAppSelector(selectPermissions);
  const [loading, setLoading] = useState(true);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("permissions") || can(permissions, "itsm.permission.read")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader title="Change Configuration" description="Configure change types, approval workflows, and CAB" actions={<Button onClick={() => showSuccess("Change", "Configuration saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {changeTypes.map((ct) => (
              <Card key={ct.id}><CardBody><h3 className="font-semibold">{ct.name}</h3><div className="mt-2 space-y-1 text-sm"><p>Approvals: {ct.approvals}</p><p>Risk: <Badge variant={ct.risk === "Low" ? "success" : ct.risk === "Medium" ? "warning" : "danger"}>{ct.risk}</Badge></p></div></CardBody></Card>
            ))}
          </div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
