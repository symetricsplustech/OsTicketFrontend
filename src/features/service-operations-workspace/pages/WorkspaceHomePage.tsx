import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function WorkspaceHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "home") throw new Error("WorkspaceHomePage requires phase 22, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Workspace Home">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
