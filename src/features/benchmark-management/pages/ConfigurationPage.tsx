import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { benchmarkManagementRoutes } from "../../model/benchmarkManagementRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 29 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 29, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={benchmarkManagementRoutes} namespace="phase29" scope="Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
