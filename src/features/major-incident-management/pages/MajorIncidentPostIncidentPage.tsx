import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentPostIncidentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "post-incident") throw new Error("MajorIncidentPostIncidentPage requires phase 3, module post-incident");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Post Incident"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}