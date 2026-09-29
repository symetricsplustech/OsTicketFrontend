import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function ProblemWorkspacePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "workspace") throw new Error("ProblemWorkspacePage requires phase 4, module workspace");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Problem Workspace"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}