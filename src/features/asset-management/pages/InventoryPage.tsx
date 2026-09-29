import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function InventoryPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "inventory") throw new Error("InventoryPage requires phase 15, module inventory");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Inventory">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
