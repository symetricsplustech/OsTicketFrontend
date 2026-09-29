import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { DispatchBoard } from "@shared/components/DispatchBoard";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { SlaPanel } from "@shared/components/SlaPanel";
import { AssignmentPanel } from "@shared/components/AssignmentPanel";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { Loader2 } from "lucide-react";

export function WorkspaceScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Workspace" description="Operational workspace with live context" />
      <div className="grid gap-6 md:grid-cols-2">
        <SlaPanel sla={{ responseTarget: "15 min", resolutionTarget: "4h", startedAt: new Date().toISOString(), paused: false, breached: false }} />
        <AssignmentPanel assignment={{ group: "Ops", assignedTo: "Engineer", assignedBy: "System", assignedAt: new Date().toISOString(), method: "auto" }} onAssign={() => {}} onReassign={() => {}} onAssignToMe={() => {}} />
      </div>
      <Card><CardBody><DispatchBoard tickets={[]} loading onAssign={() => {}} onReassign={() => {}} onSchedule={() => {}} onEscalate={() => {}} onEngineerOpen={() => {}} onTicketOpen={() => {}} /></CardBody></Card>
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityStream entries={[]} loading />
        <EngineerPicker engineers={[]} onSelect={() => {}} onAssign={() => {}} placeholder="Search engineers…" />
      </div>
      <RelationshipManager relationships={[]} sourceType="Record" sourceId="ws" onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[]} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
