import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function ReleaseConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Release Configuration" description="Configure release management policies" />
      <PolicyBuilderPage title="Release Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
