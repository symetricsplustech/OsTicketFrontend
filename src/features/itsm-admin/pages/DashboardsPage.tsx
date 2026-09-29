import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { reportingRoutes } from "../model/reportingRoutes";

export function DashboardsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 32 || screen.module !== "dashboards") throw new Error("DashboardsPage requires phase 32, module dashboards");
  return (
    <WorkRecordGovernance screen={screen} routes={reportingRoutes} namespace="phase32" scope="Dashboards">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
