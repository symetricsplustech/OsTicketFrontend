import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function TargetsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "targets") throw new Error("TargetsPage requires phase 30, module targets");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Targets">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
