import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { automationRoutes } from "../../model/automationRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 36 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 36, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={automationRoutes} namespace="phase36" scope="Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
