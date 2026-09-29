import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function ImprovementConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Improvement Configuration" description="Configure continuous improvement policies" />
      <PolicyBuilderPage title="Improvement Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
