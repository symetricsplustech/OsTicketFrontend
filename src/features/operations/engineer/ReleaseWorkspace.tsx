import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Tabs } from "@shared/components/Tabs";

export function ReleaseWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Schedule", "CI / Services", "Approval", "Tasks", "Validation", "PIR", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="REL000123 — Release Record" description="Release management and deployment tracking." />
      <div className="flex items-center gap-3"><Badge variant="warning">Scheduled</Badge><Badge variant="info">Normal</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Release details</div></CardBody></Card>
    </div>
  );
}

export function ImprovementWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Risk", "Plan", "Approval", "Implementation", "Validation", "PIR", "Attachments", "Activity", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="IMP000045 — Improvement Record" description="Track improvement proposals and outcomes." />
      <div className="flex items-center gap-3"><Badge variant="info">Approved</Badge><Badge variant="warning">In Progress</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Improvement details</div></CardBody></Card>
    </div>
  );
}
