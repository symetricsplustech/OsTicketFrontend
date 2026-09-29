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
import { GitBranch, Plus, ArrowRight, CheckCircle, Clock } from "lucide-react";

type TabId = "states" | "transitions" | "properties" | "permissions" | "audit";

const tabs = [
  { id: "states", label: "States", icon: CheckCircle },
  { id: "transitions", label: "Transitions", icon: ArrowRight },
  { id: "properties", label: "Properties", icon: Clock },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: Clock },
];

const states = [
  { id: "1", name: "New", type: "Initial", allowedTransitions: ["In Progress", "On Hold"] },
  { id: "2", name: "In Progress", type: "Active", allowedTransitions: ["Resolved", "On Hold"] },
  { id: "3", name: "On Hold", type: "Active", allowedTransitions: ["In Progress", "Cancelled"] },
  { id: "4", name: "Resolved", type: "Terminal", allowedTransitions: ["Closed"] },
  { id: "5", name: "Closed", type: "Terminal", allowedTransitions: [] },
];

export function LifecycleConfig() {
  const [activeTab, setActiveTab] = useState<TabId>("states");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Lifecycle State Configuration" description="Define lifecycle states, state transitions, and properties" actions={<Button onClick={() => showSuccess("Lifecycle", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "states" ? (
          <DataTable columns={[{ key: "name", header: "State", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "type", header: "Type", render: (r: { type: string }) => <Badge variant={r.type === "Initial" ? "warning" : r.type === "Terminal" ? "success" : "info"}>{r.type}</Badge> }, { key: "transitions", header: "Allowed Transitions", render: (r: { allowedTransitions: string[] }) => r.allowedTransitions.join(", ") || "—" }]} rows={states} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
