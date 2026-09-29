import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { assetManagementRoutes } from "../../model/assetManagementRoutes";

export function AssetsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 15 || screen.module !== "assets") throw new Error("AssetsPage requires phase 15, module assets");
  return (
    <WorkRecordGovernance screen={screen} routes={assetManagementRoutes} namespace="phase15" scope="Assets">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
