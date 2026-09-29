import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function ChangeConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Change Configuration" description="Configure change management policies and approval rules" />
      <PolicyBuilderPage title="Approval Conditions" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
