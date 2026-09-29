import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { SlaPanel } from "@shared/components/SlaPanel";
import { Loader2 } from "lucide-react";

export function SlaConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="SLA Configuration" description="Configure service level agreements and escalation policies" />
      <SlaPanel sla={{ responseTarget: "15 min", resolutionTarget: "4h", startedAt: new Date().toISOString(), paused: false, breached: false }} />
      <PolicyBuilderPage title="SLA Conditions" rules={[]} onChange={() => {}} />
    </div>
  );
}
