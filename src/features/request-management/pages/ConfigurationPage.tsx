import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 6, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}