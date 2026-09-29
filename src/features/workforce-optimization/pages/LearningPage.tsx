import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { workforceRoutes } from "../model/workforceRoutes";

export function LearningPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 26 || screen.module !== "learning") throw new Error("LearningPage requires phase 26, module learning");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={workforceRoutes}
      namespace="phase26"
      scope="Workforce Optimization"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
