import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function ServiceStatusPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "service-status") throw new Error("ServiceStatusPage requires phase 23, module service-status");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Service Status">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
