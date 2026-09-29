import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function AppointmentsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "appointments") throw new Error("AppointmentsPage requires phase 23, module appointments");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Appointments">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
