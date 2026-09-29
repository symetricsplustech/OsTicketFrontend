import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function DashboardsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "dashboards") throw new Error("DashboardsPage requires phase 30, module dashboards");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Dashboards">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
