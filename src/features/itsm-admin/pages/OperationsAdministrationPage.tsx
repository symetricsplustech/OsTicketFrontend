import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { adminCenterRoutes } from "../../model/adminCenterRoutes";

export function OperationsAdministrationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 40 || screen.module !== "operations") throw new Error("OperationsAdministrationPage requires phase 40, module operations");
  return (
    <WorkRecordGovernance screen={screen} routes={adminCenterRoutes} namespace="phase40" scope="ITSM Administration Center">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
