import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { Loader2 } from "lucide-react";

export function CmdbConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="CMDB Configuration" description="Configure configuration items and relationships" />
      <PolicyBuilderPage title="CI Rules" rules={[]} onChange={() => {}} />
      <RelationshipManager relationships={[]} sourceType="CI" sourceId="cmdb" onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[]} />
    </div>
  );
}
