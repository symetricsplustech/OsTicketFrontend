import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { ExperienceSwitcher } from "@shared/components/ExperienceSwitcher";
import { Loader2 } from "lucide-react";

export function SaaSInstancesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Instance Registry" description="Manage platform instances" />
      <ExperienceSwitcher experiences={[]} activeExperience="saas" onSwitch={() => {}} />
      <PolicyBuilderPage title="Instance Rules" rules={[]} onChange={() => {}} />
      <AuditExplorer entries={[]} loading onFilter={() => {}} />
    </div>
  );
}
