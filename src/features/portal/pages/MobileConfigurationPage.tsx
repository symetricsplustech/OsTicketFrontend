import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { mobileRoutes } from "../../model/mobileRoutes";

export function MobileConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 34 || screen.module !== "configuration") throw new Error("MobileConfigurationPage requires phase 34, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={mobileRoutes} namespace="phase34" scope="Mobile Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
