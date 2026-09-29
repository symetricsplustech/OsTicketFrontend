import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function EmployeeCenterHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "home") throw new Error("EmployeeCenterHomePage requires phase 23, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Home">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
