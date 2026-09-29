import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { universalRequestRoutes } from "../../model/universalRequestRoutes";

export function RequesterPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 8 || screen.module !== "requester") throw new Error("RequesterPage requires phase 8, module requester");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={universalRequestRoutes}
      namespace="phase08"
      scope="Requester"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}