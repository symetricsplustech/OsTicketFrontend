import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function RoutingConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Routing & Escalation Configuration" description="Configure assignment, routing, and escalation rules" />
      <PolicyBuilderPage title="Routing Rules" rules={[]} onChange={() => {}} />
      <PolicyBuilderPage title="Escalation Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
