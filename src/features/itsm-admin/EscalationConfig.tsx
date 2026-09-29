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
import { Scale, ArrowUpRight, Clock, Users, Settings } from "lucide-react";

type TabId = "levels" | "rules" | "notifications" | "recipients" | "permissions" | "audit";

const tabs = [
  { id: "levels", label: "Levels", icon: Scale },
  { id: "rules", label: "Rules", icon: ArrowUpRight },
  { id: "notifications", label: "Notifications", icon: Clock },
  { id: "recipients", label: "Recipients", icon: Users },
  { id: "permissions", label: "Permissions", icon: Scale },
  { id: "audit", label: "Audit", icon: Clock },
];

const escalationLevels = [
  { id: "1", level: "Level 1", timeout: "15 min", notify: "Team Lead" },
  { id: "2", level: "Level 2", timeout: "30 min", notify: "Manager" },
  { id: "3", level: "Level 3", timeout: "60 min", notify: "Director" },
];

export function EscalationConfig() {
  const [activeTab, setActiveTab] = useState<TabId>("levels");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Escalation Configuration" description="Define escalation levels, rules, and notification recipients" actions={<Button onClick={() => showSuccess("Escalation", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "levels" ? (
          <DataTable columns={[{ key: "level", header: "Level", render: (r: { level: string }) => <span className="font-medium">{r.level}</span> }, { key: "timeout", header: "Timeout", render: (r: { timeout: string }) => <Badge variant="warning">{r.timeout}</Badge> }, { key: "notify", header: "Notify", render: (r: { notify: string }) => r.notify }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={escalationLevels} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
