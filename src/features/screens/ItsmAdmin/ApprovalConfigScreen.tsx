import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function ApprovalConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Approval Configuration" description="Configure approval workflows and conditions" />
      <PolicyBuilderPage title="Approval Conditions" rules={[]} onChange={() => {}} />
    </div>
  );
}
