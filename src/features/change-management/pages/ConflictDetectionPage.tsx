import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ConflictDetectionPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "conflict-detection") throw new Error("ConflictDetectionPage requires phase 5, module conflict-detection");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Conflict Detection"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}