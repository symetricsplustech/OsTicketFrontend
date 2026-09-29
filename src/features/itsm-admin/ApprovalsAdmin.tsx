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
import { KeyRound, Shield, Users, ArrowUpRight, FileText, CheckCircle, Activity } from "lucide-react";

type TabId = "policies" | "approver-rules" | "delegation" | "escalation" | "audit";

const tabs = [
  { id: "policies", label: "Policies", icon: Shield },
  { id: "approver-rules", label: "Approver Rules", icon: Users },
  { id: "delegation", label: "Delegation", icon: ArrowUpRight },
  { id: "escalation", label: "Escalation", icon: ArrowUpRight },
  { id: "audit", label: "Audit", icon: Activity },
];

const policies = [
  { id: "1", name: "Incident Approval", threshold: "$500", approver: "Manager" },
  { id: "2", name: "Change Approval", threshold: "$1000", approver: "CAB" },
  { id: "3", name: "Budget Approval", threshold: "$5000", approver: "Director" },
];

export function ApprovalsAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("policies");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("delegation") || can(permissions, "itsm.approval.manage")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals Admin" description="Manage approval policies, approver rules, delegation, and audit" actions={<Button onClick={() => showSuccess("Approvals", "Saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "policies" ? (
          <DataTable columns={[{ key: "name", header: "Policy", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "threshold", header: "Threshold", render: (r: { threshold: string }) => <Badge variant="warning">{r.threshold}</Badge> }, { key: "approver", header: "Approver", render: (r: { approver: string }) => r.approver }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={policies} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
