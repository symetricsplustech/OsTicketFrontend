import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { Bell, Rule, FileText, AlertTriangle, CheckCircle, Activity, Mail } from "lucide-react";

type TabId = "rules" | "templates" | "delivery" | "failures";

const tabs = [
  { id: "rules", label: "Rules", icon: Rule },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "delivery", label: "Delivery Logs", icon: CheckCircle },
  { id: "failures", label: "Failures", icon: AlertTriangle },
];

const deliveryLogs = [
  { id: "1", template: "Incident Created", status: "Delivered", time: "2 min ago", channel: "Email" },
  { id: "2", template: "Status Update", status: "Failed", time: "5 min ago", channel: "SMS" },
  { id: "3", template: "Escalation Alert", status: "Delivered", time: "10 min ago", channel: "Push" },
];

const failures = [
  { id: "1", template: "Status Update", error: "Invalid recipient", time: "1 hour ago", retry: true },
  { id: "2", template: "Assignment", error: "Template not found", time: "3 hours ago", retry: false },
];

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("rules");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Configuration" description="Manage notification rules, templates, delivery logs, and failures" actions={<Button onClick={() => showSuccess("Notifications", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "rules" ? (
          <Card><CardBody><p className="text-sm text-slate-500 mb-4">Notification rules define when and how notifications are sent</p><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-lg border"><div><span className="font-medium">On Incident Created</span><p className="text-xs text-slate-500">Send notification when new incident is created</p></div><Badge variant="success">Active</Badge></div><div className="flex items-center justify-between p-3 rounded-lg border"><div><span className="font-medium">On Status Change</span><p className="text-xs text-slate-500">Notify on status transitions</p></div><Badge variant="success">Active</Badge></div></div><Button className="mt-4" onClick={() => showSuccess("Rule", "Created")}>Add Rule</Button></CardBody></Card>
        ) : activeTab === "delivery" ? (
          <DataTable columns={[{ key: "template", header: "Template", render: (r: { template: string }) => <span className="font-medium">{r.template}</span> }, { key: "channel", header: "Channel", render: (r: { channel: string }) => r.channel }, { key: "status", header: "Status", render: (r: { status: string }) => <Badge variant={r.status === "Delivered" ? "success" : "danger"}>{r.status}</Badge> }, { key: "time", header: "Time", render: (r: { time: string }) => r.time }]} rows={deliveryLogs} rowKey={(r) => r.id} searchValue={searchValue} onSearchChange={setSearchValue} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "failures" ? (
          <DataTable columns={[{ key: "template", header: "Template", render: (r: { template: string }) => <span className="font-medium">{r.template}</span> }, { key: "error", header: "Error", render: (r: { error: string }) => <Badge variant="danger">{r.error}</Badge> }, { key: "time", header: "Time", render: (r: { time: string }) => r.time }, { key: "retry", header: "Retry", render: (r: { retry: boolean }) => r.retry ? <Badge variant="warning">Pending</Badge> : <Badge variant="muted">—</Badge> }]} rows={failures} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
