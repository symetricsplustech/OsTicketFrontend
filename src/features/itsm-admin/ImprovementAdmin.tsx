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
import { GitBranch, Lightbulb, Target, TrendingUp, CheckCircle, Activity } from "lucide-react";

type TabId = "overview" | "proposals" | "tracking" | "categories" | "approval" | "notifications" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "proposals", label: "Proposals", icon: Lightbulb },
  { id: "tracking", label: "Tracking", icon: TrendingUp },
  { id: "categories", label: "Categories", icon: Target },
  { id: "approval", label: "Approval", icon: CheckCircle },
  { id: "notifications", label: "Notifications", icon: Activity },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: Activity },
];

export function ImprovementAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  return (
    <div className="space-y-6">
      <PageHeader title="Improvement Management" description="Manage improvement records, proposals, and tracking" actions={<Button onClick={() => showSuccess("Improvement", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardBody><h3 className="font-semibold">Improvement Overview</h3><div className="grid grid-cols-2 gap-4 mt-3"><div><p className="text-sm text-slate-500">Open Proposals</p><p className="text-2xl font-bold">15</p></div><div><p className="text-sm text-slate-500">Implemented</p><p className="text-2xl font-bold text-brand-600">42</p></div><div><p className="text-sm text-slate-500">Benefits</p><p className="text-2xl font-bold">$120K</p></div><div><p className="text-sm text-slate-500">Savings</p><p className="text-2xl font-bold">28%</p></div></div></CardBody></Card>
            <Card><CardBody><h3 className="font-semibold">Categories</h3><div className="space-y-2 mt-3"><Badge variant="success">Process Improvement</Badge><Badge variant="info">Technology Upgrade</Badge><Badge variant="warning">Cost Reduction</Badge></div></CardBody></Card>
          </div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
