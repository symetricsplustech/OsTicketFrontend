import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { enterpriseOperationsRoutes } from "../model/enterpriseOperationsRoutes";

export function ImprovementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 31 || screen.module !== "improvement") throw new Error("ImprovementPage requires phase 31, module improvement");
  return (
    <WorkRecordGovernance screen={screen} routes={enterpriseOperationsRoutes} namespace="phase31" scope="Improvement">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
