import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { ActivityStream } from "@shared/components/ActivityStream";
import { LifecycleTimeline } from "@shared/components/LifecycleTimeline";
import { DataTable } from "@shared/components/DataTable";

interface MajorIncidentRecord {
  id: string; number: string; title: string; severity: string; status: string; impact: string; updated: string;
}

const majorIncidents: MajorIncidentRecord[] = [
  { id: "1", number: "MIT00001", title: "Production database outage", severity: "P1", status: "Active", impact: "All customers", updated: "5 min ago" },
  { id: "2", number: "MIT00002", title: "Customer portal authentication failure", severity: "P2", status: "Monitoring", impact: "Portal users", updated: "30 min ago" },
];

export function MajorIncidentWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Timeline", "Communications", "Resolution", "Post-Incident", "Audit"];

  const timelineSteps = [
    { id: "1", label: "Detected", state: "detected", isActive: false, isCompleted: true, isCurrent: false, timestamp: "2024-01-15T08:00:00", actor: "System" },
    { id: "2", label: "Investigating", state: "investigating", isActive: true, isCompleted: true, isCurrent: true, timestamp: "2024-01-15T08:05:00", actor: "On-Call Engineer" },
    { id: "3", label: "Communicating", state: "communicating", isActive: false, isCompleted: false, isCurrent: false, timestamp: "", actor: "" },
    { id: "4", label: "Resolved", state: "resolved", isActive: false, isCompleted: false, isCurrent: false, timestamp: "", actor: "" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="MIT00001 — Major Incident" description="Coordinate major incident response and communications." />
      <div className="flex items-center gap-3"><Badge variant="danger">P1</Badge><Badge variant="danger">Active</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <LifecycleTimeline steps={timelineSteps} />
          <ActivityStream entries={[{ id: "1", actor: "On-Call Engineer", action: "Investigation started", timestamp: "2024-01-15T08:05:00" }]} />
        </div>
        <DataTable columns={[
          { key: "title", header: "Field", render: (row: MajorIncidentRecord) => <span className="font-medium">{row.title}</span> },
          { key: "status", header: "Value", render: (row: MajorIncidentRecord) => <span>{row.status}</span> },
        ]} rows={majorIncidents} rowKey={(r) => r.id} loading={false} emptyTitle="No data" />
      </div></CardBody></Card>
    </div>
  );
}
