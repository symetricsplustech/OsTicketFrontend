import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { enterpriseOperationsRoutes } from "../model/enterpriseOperationsRoutes";

export function InsightsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 31 || screen.module !== "insights") throw new Error("InsightsPage requires phase 31, module insights");
  return (
    <WorkRecordGovernance screen={screen} routes={enterpriseOperationsRoutes} namespace="phase31" scope="Insights">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
