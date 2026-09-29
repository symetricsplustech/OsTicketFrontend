import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { performanceAnalyticsRoutes } from "../../model/performanceAnalyticsRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 30 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 30, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={performanceAnalyticsRoutes} namespace="phase30" scope="Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
