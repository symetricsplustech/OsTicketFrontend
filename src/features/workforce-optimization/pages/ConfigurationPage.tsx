import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { workforceRoutes } from "../model/workforceRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 26 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 26, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={workforceRoutes}
      namespace="phase26"
      scope="Workforce Optimization"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
