import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function CMDBHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "home") throw new Error("CMDBHomePage requires phase 13, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="CMDB Home">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
