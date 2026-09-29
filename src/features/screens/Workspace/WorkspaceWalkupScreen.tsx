import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { DispatchBoard } from "@shared/components/DispatchBoard";
import { Loader2 } from "lucide-react";

export function WorkspaceWalkupScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Walk-up" description="Walk-up dispatch queue" />
      <DispatchBoard tickets={[]} loading onAssign={() => {}} onReassign={() => {}} onSchedule={() => {}} onEscalate={() => {}} onEngineerOpen={() => {}} onTicketOpen={() => {}} />
    </div>
  );
}
