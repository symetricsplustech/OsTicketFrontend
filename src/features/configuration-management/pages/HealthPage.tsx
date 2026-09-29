import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function HealthPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "health") throw new Error("HealthPage requires phase 13, module health");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Health">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
