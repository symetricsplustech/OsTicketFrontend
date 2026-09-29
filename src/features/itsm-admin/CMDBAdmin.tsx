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
import { Activity, Box, Network, GitBranch, Users, Shield, Import, Heartbeat } from "lucide-react";

type TabId = "services" | "offerings" | "ci-classes" | "cis" | "relationships" | "owners" | "support-groups" | "import" | "health";

const tabs = [
  { id: "services", label: "Services", icon: Activity },
  { id: "offerings", label: "Service Offerings", icon: Shield },
  { id: "ci-classes", label: "CI Classes", icon: Box },
  { id: "cis", label: "CIs", icon: Network },
  { id: "relationships", label: "Relationships", icon: GitBranch },
  { id: "owners", label: "Owners", icon: Users },
  { id: "support-groups", label: "Support Groups", icon: Users },
  { id: "import", label: "Import/Discovery", icon: Import },
  { id: "health", label: "Health", icon: Heartbeat },
];

const services = [
  { id: "1", name: "Email Service", status: "Active", health: "Healthy" },
  { id: "2", name: "Authentication Service", status: "Active", health: "Healthy" },
  { id: "3", name: "Payment Gateway", status: "Active", health: "Degraded" },
];

export function CMDBAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("services");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  return (
    <div className="space-y-6">
      <PageHeader title="Services & CMDB Admin" description="Manage services, CI classes, relationships, and CMDB health" actions={<Button onClick={() => showSuccess("CMDB", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "services" ? (
          <DataTable columns={[{ key: "name", header: "Service", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "status", header: "Status", render: (r: { status: string }) => <Badge variant={r.status === "Active" ? "success" : "muted"}>{r.status}</Badge> }, { key: "health", header: "Health", render: (r: { health: string }) => <Badge variant={r.health === "Healthy" ? "success" : "warning"}>{r.health}</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">View</Button> }]} rows={services} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
