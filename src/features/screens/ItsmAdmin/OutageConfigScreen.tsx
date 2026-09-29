import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function OutageConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Outage Configuration" description="Configure outage management policies" />
      <PolicyBuilderPage title="Outage Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
