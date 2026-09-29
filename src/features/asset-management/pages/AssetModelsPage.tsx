import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function AssetModelsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "models") throw new Error("AssetModelsPage requires phase 15, module models");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Asset Models">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
