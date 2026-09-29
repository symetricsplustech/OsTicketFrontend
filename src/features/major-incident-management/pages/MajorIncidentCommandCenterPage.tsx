import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentCommandCenterPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "command") throw new Error("MajorIncidentCommandCenterPage requires phase 3, module command");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Command Center"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}