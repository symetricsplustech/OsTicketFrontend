import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { enterpriseOperationsRoutes } from "../model/enterpriseOperationsRoutes";

export function AnalysisPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 31 || screen.module !== "analysis") throw new Error("AnalysisPage requires phase 31, module analysis");
  return (
    <WorkRecordGovernance screen={screen} routes={enterpriseOperationsRoutes} namespace="phase31" scope="Analysis">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
