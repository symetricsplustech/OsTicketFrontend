import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { SlaPanel } from "@shared/components/SlaPanel";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function WorkspaceOutagesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Outages" description="Manage and track outages" />
      <SlaPanel sla={{ responseTarget: "1h", resolutionTarget: "24h", startedAt: new Date().toISOString(), paused: false, breached: false }} onEscalate={() => {}} />
      <PolicyBuilderPage title="Outage Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
