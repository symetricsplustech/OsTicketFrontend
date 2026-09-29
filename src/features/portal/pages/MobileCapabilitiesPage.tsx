import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { mobileRoutes } from "../../model/mobileRoutes";

export function MobileCapabilitiesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 34 || screen.module !== "capabilities") throw new Error("MobileCapabilitiesPage requires phase 34, module capabilities");
  return (
    <WorkRecordGovernance screen={screen} routes={mobileRoutes} namespace="phase34" scope="Mobile Capabilities">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
