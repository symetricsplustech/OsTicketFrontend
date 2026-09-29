import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { adminCenterRoutes } from "../../model/adminCenterRoutes";

export function IntegrationAdministrationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 40 || screen.module !== "integration") throw new Error("IntegrationAdministrationPage requires phase 40, module integration");
  return (
    <WorkRecordGovernance screen={screen} routes={adminCenterRoutes} namespace="phase40" scope="ITSM Administration Center">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
