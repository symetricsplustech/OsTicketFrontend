import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { adminCenterRoutes } from "../../model/adminCenterRoutes";

export function AnalyticsAdministrationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 40 || screen.module !== "analytics") throw new Error("AnalyticsAdministrationPage requires phase 40, module analytics");
  return (
    <WorkRecordGovernance screen={screen} routes={adminCenterRoutes} namespace="phase40" scope="ITSM Administration Center">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
