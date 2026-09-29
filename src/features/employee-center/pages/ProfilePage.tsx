import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function ProfilePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "profile") throw new Error("ProfilePage requires phase 23, module profile");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Profile">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
