import { PageHeader } from "@shared/components/PageHeader";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function ReportConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports Configuration" description="Configure reports and dashboards" />
      <PolicyBuilderPage title="Report Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
