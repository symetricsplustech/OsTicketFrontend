import { DispatchBoard } from "@shared/components/DispatchBoard";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Loader2 } from "lucide-react";

export function DispatchBoardScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dispatch Board" description="Manage and dispatch tickets across all lifecycle stages" />
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        </CardBody>
      </Card>
      <DispatchBoard
        tickets={[]}
        loading
        onAssign={() => {}}
        onReassign={() => {}}
        onSchedule={() => {}}
        onEscalate={() => {}}
        onEngineerOpen={() => {}}
        onTicketOpen={() => {}}
      />
    </div>
  );
}
