import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function RequestHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "home") throw new Error("RequestHomePage requires phase 6, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="Request Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}