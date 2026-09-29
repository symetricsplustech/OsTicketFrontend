import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function AssetLifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "lifecycle") throw new Error("AssetLifecyclePage requires phase 15, module lifecycle");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Asset Lifecycle">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
