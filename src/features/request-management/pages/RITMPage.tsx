import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function RITMPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "requested-items") throw new Error("RITMPage requires phase 6, module requested-items");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="RITM"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}