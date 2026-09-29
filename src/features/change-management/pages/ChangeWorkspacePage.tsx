import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ChangeWorkspacePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "workspace") throw new Error("ChangeWorkspacePage requires phase 5, module workspace");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Change Workspace"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}