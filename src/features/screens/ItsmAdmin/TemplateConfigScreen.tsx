import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function TemplateConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Templates Configuration" description="Configure email and notification templates" />
      <PolicyBuilderPage title="Template Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
