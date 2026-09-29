import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { SlaPanel } from "@shared/components/SlaPanel";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function WorkspaceAvailabilityScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Availability Dashboard" description="Service availability monitoring" />
      <SlaPanel sla={{ responseTarget: "15 min", resolutionTarget: "4h", startedAt: new Date().toISOString(), paused: false, breached: false }} onEscalate={() => {}} />
      <PolicyBuilderPage title="Availability Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
