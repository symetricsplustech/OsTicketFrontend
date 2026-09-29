import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 22, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
