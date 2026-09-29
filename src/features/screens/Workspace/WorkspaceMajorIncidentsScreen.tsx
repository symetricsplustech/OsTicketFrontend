import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { ActivityStream } from "@shared/components/ActivityStream";
import { SlaPanel } from "@shared/components/SlaPanel";
import { Loader2 } from "lucide-react";

export function WorkspaceMajorIncidentsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Major Incidents" description="Track and manage major incident lifecycles" />
      <SlaPanel sla={{ responseTarget: "5 min", resolutionTarget: "1h", startedAt: new Date().toISOString(), paused: false, breached: true }} onEscalate={() => {}} />
      <ActivityStream entries={[]} loading />
    </div>
  );
}
