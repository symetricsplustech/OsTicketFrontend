import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function WorkspaceServicesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Business Services" description="Service definitions and dependencies" />
      <PolicyBuilderPage title="Service Rules" rules={[]} onChange={() => {}} />
      <RelationshipManager relationships={[]} sourceType="Service" sourceId="svc" onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[]} />
    </div>
  );
}
