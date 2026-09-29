import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { majorIncidentRoutes } from "../../model/majorIncidentRoutes";

export function MajorIncidentCandidatesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3 || screen.module !== "candidates") throw new Error("MajorIncidentCandidatesPage requires phase 3, module candidates");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={majorIncidentRoutes}
      namespace="phase03"
      scope="Candidates & Proposals"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}