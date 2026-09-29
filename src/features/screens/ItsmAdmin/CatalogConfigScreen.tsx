import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function CatalogConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Service Catalog Configuration" description="Configure catalog items and service definitions" />
      <PolicyBuilderPage title="Catalog Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
