import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { workforceRoutes } from "../model/workforceRoutes";

export function SkillsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 26 || screen.module !== "skills") throw new Error("SkillsPage requires phase 26, module skills");
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
