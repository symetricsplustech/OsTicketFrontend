import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function BreakdownsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "breakdowns") throw new Error("BreakdownsPage requires phase 30, module breakdowns");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Breakdowns">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
