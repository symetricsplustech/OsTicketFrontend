import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { benchmarkManagementRoutes } from "../../model/benchmarkManagementRoutes";

export function GapAnalysisPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 29 || screen.module !== "gap-analysis") throw new Error("GapAnalysisPage requires phase 29, module gap-analysis");
  return (
    <WorkRecordGovernance screen={screen} routes={benchmarkManagementRoutes} namespace="phase29" scope="Gap Analysis">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
