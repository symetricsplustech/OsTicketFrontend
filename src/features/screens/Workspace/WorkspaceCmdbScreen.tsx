import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function WorkspaceCmdbScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="CMDB" description="Configuration items and relationships" />
      <PolicyBuilderPage title="CI Rules" rules={[]} onChange={() => {}} />
      <RelationshipManager relationships={[]} sourceType="CI" sourceId="cmdb" onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[]} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
