import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function WorkspaceKnowledgeScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Manage knowledge articles and categories" />
      <PolicyBuilderPage title="Knowledge Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
