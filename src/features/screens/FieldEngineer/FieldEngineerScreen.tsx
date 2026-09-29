import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { AssignmentPanel } from "@shared/components/AssignmentPanel";
import { SlaPanel } from "@shared/components/SlaPanel";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AttachmentPanel } from "@shared/components/AttachmentPanel";
import { LifecycleTimeline } from "@shared/components/LifecycleTimeline";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { Loader2 } from "lucide-react";

export function FieldEngineerScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Field Engineer Home" description="Your daily schedule and assignments" />
      <div className="grid gap-6 md:grid-cols-2">
        <SlaPanel sla={{ responseTarget: "15 min", resolutionTarget: "4h", startedAt: new Date().toISOString(), paused: false, breached: false }} />
        <AssignmentPanel assignment={{ group: "Field Ops", assignedTo: "You", assignedBy: "System", assignedAt: new Date().toISOString(), method: "schedule" }} onAssign={() => {}} onReassign={() => {}} onAssignToMe={() => {}} />
      </div>
      <Card><CardBody><EngineerPicker engineers={[]} onSelect={() => {}} onAssign={() => {}} placeholder="Find teammates…" /></CardBody></Card>
      <LifecycleTimeline steps={[{ id: "1", label: "Scheduled", state: "scheduled", isActive: false, isCompleted: true, isCurrent: false, isFuture: false, timestamp: new Date().toISOString() }]} />
      <ActivityStream entries={[]} loading />
      <AttachmentPanel attachments={[]} onUpload={() => {}} onRemove={() => {}} onDownload={() => {}} onPreview={() => {}} />
    </div>
  );
}
