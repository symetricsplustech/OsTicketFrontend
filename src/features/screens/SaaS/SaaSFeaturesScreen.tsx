import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function SaaSFeaturesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Features" description="Manage feature flags and entitlements" />
      <PolicyBuilderPage title="Feature Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
