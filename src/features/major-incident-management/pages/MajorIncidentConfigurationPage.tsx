import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "configuration") throw new Error("MajorIncidentConfigurationPage requires phase 3, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}