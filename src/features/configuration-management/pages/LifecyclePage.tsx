import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function LifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "lifecycle") throw new Error("LifecyclePage requires phase 13, module lifecycle");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Lifecycle">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
