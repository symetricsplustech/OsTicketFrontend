import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { workforceRoutes } from "../model/workforceRoutes";

export function SchedulingPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 26 || screen.module !== "scheduling") throw new Error("SchedulingPage requires phase 26, module scheduling");
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
