import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function KnowledgeConfigScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Configuration" description="Configure knowledge base settings" />
      <PolicyBuilderPage title="Knowledge Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
