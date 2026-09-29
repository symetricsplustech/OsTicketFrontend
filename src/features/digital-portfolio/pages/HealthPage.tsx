import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { digitalPortfolioRoutes } from "../../model/digitalPortfolioRoutes";

export function HealthPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 19 || screen.module !== "health") throw new Error("HealthPage requires phase 19, module health");
  return (
    <WorkRecordGovernance screen={screen} routes={digitalPortfolioRoutes} namespace="phase19" scope="Digital Portfolio Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
