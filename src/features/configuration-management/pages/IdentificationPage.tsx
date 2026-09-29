import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function IdentificationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "identification") throw new Error("IdentificationPage requires phase 13, module identification");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Identification">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
