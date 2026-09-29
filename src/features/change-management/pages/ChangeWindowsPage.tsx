import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ChangeWindowsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "windows") throw new Error("ChangeWindowsPage requires phase 5, module windows");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Change Windows"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}