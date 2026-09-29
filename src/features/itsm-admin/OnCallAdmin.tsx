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
import { Activity, CalendarDays, Clock, AlertTriangle, Users, Settings, ArrowUpRight } from "lucide-react";

type TabId = "schedules" | "rotations" | "calendar" | "overrides" | "escalation";

const tabs = [
  { id: "schedules", label: "Schedules", icon: CalendarDays },
  { id: "rotations", label: "Rotations", icon: Activity },
  { id: "calendar", label: "Coverage Calendar", icon: Clock },
  { id: "overrides", label: "Overrides", icon: AlertTriangle },
  { id: "escalation", label: "Escalation Paths", icon: ArrowUpRight },
];

const schedules = [
  { id: "1", name: "Primary On-Call", engineer: "John Doe", start: "2024-01-15", end: "2024-01-21" },
  { id: "2", name: "Secondary On-Call", engineer: "Jane Smith", start: "2024-01-22", end: "2024-01-28" },
];

export function OnCallAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("schedules");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  const visibleTabs = useMemo(() => tabs.filter((t) => can(permissions, "itsm.oncall.manage")), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader title="On-Call Management" description="Configure on-call schedules, rotations, coverage, and escalation" actions={<Button onClick={() => showSuccess("On-Call", "Configuration saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "schedules" ? (
          <DataTable columns={[{ key: "name", header: "Schedule", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "engineer", header: "Engineer", render: (r: { engineer: string }) => r.engineer }, { key: "start", header: "Start", render: (r: { start: string }) => r.start }, { key: "end", header: "End", render: (r: { end: string }) => r.end }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={schedules} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
