import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function NotificationConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notification Configuration" description="Configure notification rules and delivery settings" />
      <PolicyBuilderPage title="Notification Conditions" rules={[]} onChange={() => {}} />
    </div>
  );
}
