import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "home") throw new Error("MajorIncidentHomePage requires phase 3, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Major Incident Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}