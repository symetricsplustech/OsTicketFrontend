import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { LifecycleTimeline } from "@shared/components/LifecycleTimeline";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AttachmentPanel } from "@shared/components/AttachmentPanel";
import { Loader2 } from "lucide-react";

export function PortalIncidentsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Incidents" description="Track your incident reports" />
      <LifecycleTimeline steps={[{ id: "1", label: "Created", state: "new", isActive: false, isCompleted: true, isCurrent: false, isFuture: false }]} />
      <ActivityStream entries={[]} loading />
      <AttachmentPanel attachments={[]} onUpload={() => {}} onRemove={() => {}} onDownload={() => {}} onPreview={() => {}} />
    </div>
  );
}
