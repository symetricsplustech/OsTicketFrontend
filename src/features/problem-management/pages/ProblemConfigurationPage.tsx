import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function ProblemConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "configuration") throw new Error("ProblemConfigurationPage requires phase 4, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Problem Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}