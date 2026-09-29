import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function ConfigurationItemsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "cis") throw new Error("ConfigurationItemsPage requires phase 13, module cis");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Configuration Items">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
