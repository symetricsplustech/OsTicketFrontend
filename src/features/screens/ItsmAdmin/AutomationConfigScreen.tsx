import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function AutomationConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Automation Configuration" description="Configure automated workflows and triggers" />
      <PolicyBuilderPage title="Automation Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
