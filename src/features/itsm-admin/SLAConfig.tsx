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
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { Shield, Clock, Calendar, ArrowUpRight, Zap, Scale } from "lucide-react";

type TabId = "definitions" | "schedules" | "holidays" | "ola" | "escalations" | "simulation";

const tabs = [
  { id: "definitions", label: "Definitions", icon: Shield },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "holidays", label: "Holidays", icon: Calendar },
  { id: "ola", label: "OLA", icon: Scale },
  { id: "escalations", label: "Escalations", icon: ArrowUpRight },
  { id: "simulation", label: "Simulation", icon: Zap },
];

const slaDefinitions = [
  { id: "1", name: "Gold SLA", response: "1h", resolution: "4h", priority: "Critical" },
  { id: "2", name: "Silver SLA", response: "4h", resolution: "24h", priority: "High" },
  { id: "3", name: "Bronze SLA", response: "8h", resolution: "48h", priority: "Medium" },
];

export function SLAConfig() {
  const [activeTab, setActiveTab] = useState<TabId>("definitions");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("holidays") || can(permissions, "itsm.sla.write")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader title="SLA / OLA Configuration" description="Define service level agreements, schedules, and escalation policies" actions={<Button onClick={() => showSuccess("SLA", "Configuration saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "definitions" ? (
          <DataTable columns={[{ key: "name", header: "SLA Name", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "response", header: "Response SLA", render: (r: { response: string }) => <Badge variant="success">{r.response}</Badge> }, { key: "resolution", header: "Resolution SLA", render: (r: { resolution: string }) => <Badge variant="info">{r.resolution}</Badge> }, { key: "priority", header: "Priority", render: (r: { priority: string }) => <Badge variant="default">{r.priority}</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={slaDefinitions} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "simulation" ? (
          <Card><CardBody><h3 className="font-semibold mb-4">SLA Simulation</h3><p className="text-sm text-slate-500 mb-4">Test SLA calculations and verify compliance</p><div className="space-y-3"><label className="text-sm font-medium">Select SLA Level</label><Select><option>Gold SLA</option><option>Silver SLA</option><option>Bronze SLA</option></Select><label className="text-sm font-medium">Simulate Scenario</label><textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={4} placeholder="Enter scenario description..." /></div><Button className="mt-4" onClick={() => showSuccess("Simulation", "Running...")}>Run Simulation</Button></CardBody></Card>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
