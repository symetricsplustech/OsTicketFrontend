import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { DispatchBoard } from "@shared/components/DispatchBoard";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { SlaPanel } from "@shared/components/SlaPanel";
import { AssignmentPanel } from "@shared/components/AssignmentPanel";
import { ActivityStream } from "@shared/components/ActivityStream";
import { Loader2 } from "lucide-react";

export function DispatcherDashboardScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dispatcher Dashboard" description="Overview of dispatch operations" />
      <div className="grid gap-6 md:grid-cols-2">
        <SlaPanel sla={{ responseTarget: "15 min", resolutionTarget: "4h", startedAt: new Date().toISOString(), paused: false, breached: false }} />
        <AssignmentPanel assignment={{ group: "Field Ops", assignedTo: "John Doe", assignedBy: "Dispatcher", assignedAt: new Date().toISOString(), method: "manual" }} onAssign={() => {}} onReassign={() => {}} onAssignToMe={() => {}} />
      </div>
      <Card><CardBody><DispatchBoard tickets={[]} loading onAssign={() => {}} onReassign={() => {}} onSchedule={() => {}} onEscalate={() => {}} onEngineerOpen={() => {}} onTicketOpen={() => {}} /></CardBody></Card>
      <ActivityStream entries={[]} loading />
    </div>
  );
}
