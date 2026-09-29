import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function OrganizationScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Organization Management" description="Manage companies and organizational structure" />
      <PolicyBuilderPage title="Organization Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
