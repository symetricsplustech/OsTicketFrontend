import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PermissionSimulator } from "@shared/components/PermissionSimulator";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function AccessScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Access Management" description="Manage permissions, roles, and effective access" />
      <PermissionSimulator permissions={[]} userId="user" userName="User" />
      <PolicyBuilderPage title="Access Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
