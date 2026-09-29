import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentCommunicationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "communications") throw new Error("MajorIncidentCommunicationsPage requires phase 3, module communications");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Communications"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}