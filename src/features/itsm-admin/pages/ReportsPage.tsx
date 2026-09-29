import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { reportingRoutes } from "../model/reportingRoutes";

export function ReportsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 32 || screen.module !== "reports") throw new Error("ReportsPage requires phase 32, module reports");
  return (
    <WorkRecordGovernance screen={screen} routes={reportingRoutes} namespace="phase32" scope="Reports">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
