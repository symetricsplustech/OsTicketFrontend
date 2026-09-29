import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function ReconciliationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "reconciliation") throw new Error("ReconciliationPage requires phase 13, module reconciliation");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Reconciliation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
