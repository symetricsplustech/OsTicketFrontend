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
import { AlertTriangle, Clock, Calendar, Bell, Shield, Activity, Settings } from "lucide-react";

type TabId = "overview" | "policies" | "schedules" | "notifications" | "escalation" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "policies", label: "Policies", icon: Shield },
  { id: "schedules", label: "Schedules", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "escalation", label: "Escalation", icon: AlertTriangle },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "audit", label: "Audit", icon: Clock },
];

export function OutageAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  return (
    <div className="space-y-6">
      <PageHeader title="Outage Management" description="Configure outage policies, schedules, and notifications" actions={<Button onClick={() => showSuccess("Outage", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardBody><h3 className="font-semibold">Outage Overview</h3><div className="grid grid-cols-2 gap-4 mt-3"><div><p className="text-sm text-slate-500">Scheduled Outages</p><p className="text-2xl font-bold">3</p></div><div><p className="text-sm text-slate-500">Active Now</p><p className="text-2xl font-bold text-brand-600">1</p></div><div><p className="text-sm text-slate-500">Maintenance Windows</p><p className="text-2xl font-bold">12</p></div></div></CardBody></Card>
            <Card><CardBody><h3 className="font-semibold">Recent Outages</h3><div className="space-y-2 mt-3"><Badge variant="danger">DB Migration</Badge><Badge variant="warning">Server Upgrade</Badge><Badge variant="info">Network Maintenance</Badge></div></CardBody></Card>
          </div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
