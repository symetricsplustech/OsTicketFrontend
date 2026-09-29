import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AttachmentPanel } from "@shared/components/AttachmentPanel";
import { Loader2 } from "lucide-react";

export function RequesterPortalScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Requester Portal" description="Self-service help and request tracking" />
      <PolicyBuilderPage title="Eligibility Rules" rules={[]} onChange={() => {}} />
      <ActivityStream entries={[]} loading />
      <AttachmentPanel attachments={[]} onUpload={() => {}} onRemove={() => {}} onDownload={() => {}} onPreview={() => {}} />
    </div>
  );
}
