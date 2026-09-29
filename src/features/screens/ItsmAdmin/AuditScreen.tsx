import { PageHeader } from "@shared/components/PageHeader";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { Loader2 } from "lucide-react";

export function AuditScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Instance Audit" description="Full audit trail for this instance" />
      <AuditExplorer entries={[]} loading onFilter={() => {}} onExport={() => {}} />
    </div>
  );
}
