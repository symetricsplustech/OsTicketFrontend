import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function OnCallConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="On-Call Configuration" description="Configure on-call schedules and escalation policies" />
      <PolicyBuilderPage title="On-Call Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
