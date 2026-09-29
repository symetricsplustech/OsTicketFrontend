import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { DispatchBoard } from "@shared/components/DispatchBoard";
import { ActivityStream } from "@shared/components/ActivityStream";
import { Loader2 } from "lucide-react";

export function PortalRequestsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Requests" description="Track and manage your requests" />
      <DispatchBoard tickets={[]} loading onAssign={() => {}} onReassign={() => {}} onSchedule={() => {}} onEscalate={() => {}} onEngineerOpen={() => {}} onTicketOpen={() => {}} />
      <ActivityStream entries={[]} loading />
    </div>
  );
}
