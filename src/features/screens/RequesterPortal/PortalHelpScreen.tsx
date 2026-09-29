import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { ActivityStream } from "@shared/components/ActivityStream";
import { Loader2 } from "lucide-react";

export function PortalHelpScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Get Help" description="Find help and submit requests" />
      <PolicyBuilderPage title="Help Eligibility Rules" rules={[]} onChange={() => {}} />
      <ActivityStream entries={[]} loading />
    </div>
  );
}
