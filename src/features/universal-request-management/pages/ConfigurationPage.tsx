import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { universalRequestRoutes } from "../../model/universalRequestRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 8 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 8, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={universalRequestRoutes}
      namespace="phase08"
      scope="Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}