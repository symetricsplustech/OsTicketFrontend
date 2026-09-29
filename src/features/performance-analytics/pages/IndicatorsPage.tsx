import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function IndicatorsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "indicators") throw new Error("IndicatorsPage requires phase 30, module indicators");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Indicators">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
