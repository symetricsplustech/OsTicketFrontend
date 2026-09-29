import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { Loader2 } from "lucide-react";

export function PortalCatalogScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Service Catalog" description="Browse and request services" />
      <PolicyBuilderPage title="Catalog Eligibility Rules" rules={[]} onChange={() => {}} />
      <RelationshipManager relationships={[]} sourceType="Request" sourceId="catalog" onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[]} />
    </div>
  );
}
