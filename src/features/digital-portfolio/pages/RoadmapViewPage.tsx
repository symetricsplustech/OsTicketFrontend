import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { digitalPortfolioRoutes } from "../../model/digitalPortfolioRoutes";

export function RoadmapViewPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 19 || screen.module !== "roadmap-view") throw new Error("RoadmapViewPage requires phase 19, module roadmap-view");
  return (
    <WorkRecordGovernance screen={screen} routes={digitalPortfolioRoutes} namespace="phase19" scope="Digital Portfolio Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
