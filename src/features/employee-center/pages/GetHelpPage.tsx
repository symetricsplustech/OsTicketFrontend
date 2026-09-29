import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function GetHelpPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "get-help") throw new Error("GetHelpPage requires phase 23, module get-help");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Get Help">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
