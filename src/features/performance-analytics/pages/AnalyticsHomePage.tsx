import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function AnalyticsHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "home") throw new Error("AnalyticsHomePage requires phase 30, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Analytics Home">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
