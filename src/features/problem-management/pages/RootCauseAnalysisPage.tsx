import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function RootCauseAnalysisPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "rca") throw new Error("RootCauseAnalysisPage requires phase 4, module rca");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Root Cause Analysis"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}