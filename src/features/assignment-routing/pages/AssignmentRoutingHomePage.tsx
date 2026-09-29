import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assignmentRoutingRoutes } from "../../model/assignmentRoutingRoutes";

export function AssignmentRoutingHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "home") throw new Error("AssignmentRoutingHomePage requires phase 11, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={assignmentRoutingRoutes}
      namespace="phase11"
      scope="Assignment, Routing, Skills & Queues"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}