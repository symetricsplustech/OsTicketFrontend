import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function IncidentConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Incident Configuration" description="Configure incident types, priorities, and lifecycle rules" />
      <PolicyBuilderPage title="Assignment Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} onExport={() => {}} />
    </div>
  );
}
