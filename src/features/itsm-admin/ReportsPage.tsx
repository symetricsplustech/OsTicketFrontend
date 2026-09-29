import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { BarChart3, PieChart, LineChart, FileText, Plus, Settings } from "lucide-react";

type TabId = "overview" | "incidents" | "problems" | "changes" | "sla" | "custom" | "scheduling" | "permissions" | "audit";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "incidents", label: "Incidents", icon: FileText },
  { id: "problems", label: "Problems", icon: FileText },
  { id: "changes", label: "Changes", icon: FileText },
  { id: "sla", label: "SLA", icon: BarChart3 },
  { id: "custom", label: "Custom Reports", icon: Settings },
  { id: "scheduling", label: "Scheduling", icon: Settings },
  { id: "permissions", label: "Permissions", icon: BarChart3 },
  { id: "audit", label: "Audit", icon: FileText },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports Configuration" description="Configure ITSM reports, dashboards, and analytics" actions={<Button onClick={() => showSuccess("Reports", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[["Incident Trends", "Line Chart", "success"], ["SLA Compliance", "Gauge", "info"], ["Resolution Times", "Bar Chart", "warning"], ["Ticket Volume", "Pie Chart", "success"], ["Agent Performance", "Table", "info"], ["Customer Satisfaction", "Gauge", "success"]].map(([name, type, variant]) => (
              <Card key={name}><CardBody><h3 className="font-semibold">{name}</h3><p className="text-sm text-slate-500 mt-1">{type}</p></CardBody></Card>
            ))}
          </div>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
