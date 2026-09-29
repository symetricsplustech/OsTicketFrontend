import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { reportingRoutes } from "../model/reportingRoutes";

export function OperationalDashboardsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 32 || screen.module !== "operational-dashboards") throw new Error("OperationalDashboardsPage requires phase 32, module operational-dashboards");
  return (
    <WorkRecordGovernance screen={screen} routes={reportingRoutes} namespace="phase32" scope="Operational Dashboards">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
