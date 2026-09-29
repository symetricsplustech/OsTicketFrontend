import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { reportingRoutes } from "../model/reportingRoutes";

export function SchedulingPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 32 || screen.module !== "scheduling") throw new Error("SchedulingPage requires phase 32, module scheduling");
  return (
    <WorkRecordGovernance screen={screen} routes={reportingRoutes} namespace="phase32" scope="Scheduling">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
