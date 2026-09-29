import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { PermissionSimulator } from "@shared/components/PermissionSimulator";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function UsersScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage users and directory entries" />
      <PermissionSimulator permissions={[]} userId="admin" userName="Admin" />
      <PolicyBuilderPage title="User Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
