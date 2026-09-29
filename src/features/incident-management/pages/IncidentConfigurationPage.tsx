import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { incidentRoutes } from "../../model/incidentRoutes";

export function IncidentConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 2 || screen.module !== "incident") throw new Error("IncidentConfigurationPage requires phase 2, module incident");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={incidentRoutes}
      namespace="phase02"
      scope="Incident Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}