import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function TransfersPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "transfers") throw new Error("TransfersPage requires phase 15, module transfers");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Transfers">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
