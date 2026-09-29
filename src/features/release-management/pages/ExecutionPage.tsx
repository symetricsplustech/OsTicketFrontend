import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { releaseManagementRoutes } from "../../model/releaseManagementRoutes";

export function ExecutionPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 20 || screen.module !== "execution") throw new Error("ExecutionPage requires phase 20, module execution");
  return (
    <WorkRecordGovernance screen={screen} routes={releaseManagementRoutes} namespace="phase20" scope="Release Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
