import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function ReportsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View and generate reports" />
      <PolicyBuilderPage title="Report Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
