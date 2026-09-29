import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function StockroomsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "stockrooms") throw new Error("StockroomsPage requires phase 15, module stockrooms");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Stockrooms">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
