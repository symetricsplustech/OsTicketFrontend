import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { operationalRoutes } from "../../model/operationalRoutes";

export function AssignmentQueuePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "assignment") throw new Error("AssignmentQueuePage requires phase 11, module assignment");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={operationalRoutes}
      namespace="phase11"
      scope="Assignment"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}