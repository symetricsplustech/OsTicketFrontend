import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { releaseManagementRoutes } from "../../model/releaseManagementRoutes";

export function ReleaseManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 20 || screen.module !== "home") throw new Error("ReleaseManagementPage requires phase 20, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={releaseManagementRoutes} namespace="phase20" scope="Release Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
