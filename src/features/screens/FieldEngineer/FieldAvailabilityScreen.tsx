import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { PolicyBuilderPage } from "@shared/components/PolicyBuilderPage";
import { Loader2 } from "lucide-react";

export function FieldAvailabilityScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Field Availability" description="Manage your availability and schedule" />
      <EngineerPicker engineers={[]} onSelect={() => {}} onAssign={() => {}} placeholder="Search engineers…" />
      <PolicyBuilderPage title="Availability Rules" rules={[]} onChange={() => {}} />
    </div>
  );
}
