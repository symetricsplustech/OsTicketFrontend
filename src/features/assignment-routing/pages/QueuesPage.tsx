import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assignmentRoutingRoutes } from "../../model/assignmentRoutingRoutes";

export function QueuesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "queues") throw new Error("QueuesPage requires phase 11, module queues");
  return (
    <WorkRecordGovernance screen={screen} routes={assignmentRoutingRoutes} namespace="phase11" scope="Queues">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}