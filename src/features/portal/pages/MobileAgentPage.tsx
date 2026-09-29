import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { mobileRoutes } from "../../model/mobileRoutes";

export function MobileAgentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 34 || screen.module !== "agent") throw new Error("MobileAgentPage requires phase 34, module agent");
  return (
    <WorkRecordGovernance screen={screen} routes={mobileRoutes} namespace="phase34" scope="Mobile Agent">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
