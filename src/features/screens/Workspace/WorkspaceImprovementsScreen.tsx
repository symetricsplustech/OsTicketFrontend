import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function WorkspaceImprovementsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Improvements" description="Track continuous improvement items" />
      <PolicyBuilderPage title="Improvement Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
