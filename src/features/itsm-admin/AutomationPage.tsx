import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { Zap, Plus, Settings, GitBranch, Clock, Trigger } from "lucide-react";

type TabId = "triggers" | "actions" | "conditions" | "workflows" | "logs" | "permissions" | "audit";

const tabs = [
  { id: "triggers", label: "Triggers", icon: Trigger },
  { id: "actions", label: "Actions", icon: Settings },
  { id: "conditions", label: "Conditions", icon: GitBranch },
  { id: "workflows", label: "Workflows", icon: Zap },
  { id: "logs", label: "Logs", icon: Clock },
  { id: "permissions", label: "Permissions", icon: Trigger },
  { id: "audit", label: "Audit", icon: Clock },
];

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("triggers");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Automation Configuration" description="Define automation rules, triggers, and actions" actions={<Button onClick={() => showSuccess("Automation", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "triggers" ? (
          <Card><CardBody><p className="text-sm text-slate-500 mb-4">Configure automation triggers that initiate workflows</p><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-lg border"><div><span className="font-medium">On Incident Created</span><p className="text-xs text-slate-500">Trigger automation when a new incident is created</p></div><Badge variant="success">Active</Badge></div><div className="flex items-center justify-between p-3 rounded-lg border"><div><span className="font-medium">On Priority Change</span><p className="text-xs text-slate-500">Trigger when priority changes</p></div><Badge variant="warning">Draft</Badge></div></div><Button className="mt-4" onClick={() => showSuccess("Trigger", "Created")}>Add Trigger</Button></CardBody></Card>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
