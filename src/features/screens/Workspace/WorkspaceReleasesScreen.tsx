import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function WorkspaceReleasesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Releases" description="Manage release lifecycles" />
      <PolicyBuilderPage title="Release Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
