import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { ActivityStream } from "@shared/components/ActivityStream";
import { Loader2 } from "lucide-react";

export function PortalApprovalsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Approvals" description="Approval requests and decisions" />
      <PolicyBuilderPage title="Approval Rules" rules={[]} onChange={() => {}} />
      <ActivityStream entries={[]} loading />
    </div>
  );
}
