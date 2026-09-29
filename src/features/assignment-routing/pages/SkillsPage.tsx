import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assignmentRoutingRoutes } from "../../model/assignmentRoutingRoutes";

export function SkillsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "skills") throw new Error("SkillsPage requires phase 11, module skills");
  return (
    <WorkRecordGovernance screen={screen} routes={assignmentRoutingRoutes} namespace="phase11" scope="Skills">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}