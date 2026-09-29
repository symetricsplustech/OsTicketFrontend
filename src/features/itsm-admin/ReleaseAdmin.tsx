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
import { CalendarDays, Rocket, Settings, CheckCircle, Activity, GitBranch } from "lucide-react";

type TabId = "overview" | "pipelines" | "stages" | "deployment" | "approval" | "notifications" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "pipelines", label: "Pipelines", icon: Rocket },
  { id: "stages", label: "Stages", icon: GitBranch },
  { id: "deployment", label: "Deployment", icon: CalendarDays },
  { id: "approval", label: "Approval", icon: CheckCircle },
  { id: "notifications", label: "Notifications", icon: Activity },
  { id: "permissions", label: "Permissions", icon: CheckCircle },
  { id: "audit", label: "Audit", icon: CalendarDays },
];

export function ReleaseAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  return (
    <div className="space-y-6">
      <PageHeader title="Release Management" description="Configure release pipelines, stages, and deployment policies" actions={<Button onClick={() => showSuccess("Release", "Configuration saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[["Production", 5, "success"], ["Staging", 3, "info"], ["Development", 12, "warning"]].map(([name, releases, variant]) => (
              <Card key={name}><CardBody><h3 className="font-semibold">{name}</h3><p className="text-sm text-slate-500 mt-1">{releases} releases</p><Badge variant={variant as any}>{releases}</Badge></CardBody></Card>
            ))}
          </div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
