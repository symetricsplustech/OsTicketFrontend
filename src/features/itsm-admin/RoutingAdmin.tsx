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
import { Network, Users, Clock, Shield, Settings, Activity, ArrowRight, Play } from "lucide-react";

type TabId = "assignment-rules" | "routing-rules" | "queues" | "skills" | "capacity" | "fallback" | "simulation";

const tabs = [
  { id: "assignment-rules", label: "Assignment Rules", icon: Settings },
  { id: "routing-rules", label: "Routing Rules", icon: Network },
  { id: "queues", label: "Queues", icon: Users },
  { id: "skills", label: "Skills", icon: Activity },
  { id: "capacity", label: "Capacity", icon: Clock },
  { id: "fallback", label: "Fallback Rules", icon: ArrowRight },
  { id: "simulation", label: "Simulation", icon: Play },
];

const queues = [
  { id: "1", name: "General Support", agents: 12, pending: 5 },
  { id: "2", name: "Engineering", agents: 8, pending: 2 },
  { id: "3", name: "Security", agents: 4, pending: 1 },
];

export function RoutingAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("assignment-rules");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("fallback") || can(permissions, "itsm.routing.manage")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader title="Routing & Assignment Admin" description="Configure assignment rules, queues, skills, and fallback routing" actions={<Button onClick={() => showSuccess("Routing", "Configuration saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "queues" ? (
          <DataTable columns={[{ key: "name", header: "Queue", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "agents", header: "Agents", render: (r: { agents: number }) => <Badge variant="success">{r.agents}</Badge> }, { key: "pending", header: "Pending", render: (r: { pending: number }) => <Badge variant={r.pending > 3 ? "danger" : "info"}>{r.pending}</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Configure</Button> }]} rows={queues} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "simulation" ? (
          <Card><CardBody><h3 className="font-semibold mb-4">Routing Simulation</h3><p className="text-sm text-slate-500 mb-4">Test routing rules and see assignment results</p><Button onClick={() => showSuccess("Simulation", "Running routing simulation...")}><Play className="inline h-4 w-4 mr-2" />Run Simulation</Button></CardBody></Card>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
