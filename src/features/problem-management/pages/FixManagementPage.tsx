import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function FixManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "fix-management") throw new Error("FixManagementPage requires phase 4, module fix-management");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Fix Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}