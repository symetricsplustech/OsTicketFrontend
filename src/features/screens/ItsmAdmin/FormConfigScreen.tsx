import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function FormConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Forms & Fields Configuration" description="Configure form layouts and field policies" />
      <PolicyBuilderPage title="Form Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
