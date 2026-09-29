import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { enterpriseOperationsRoutes } from "../model/enterpriseOperationsRoutes";

export function ProcessMapPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 31 || screen.module !== "process-map") throw new Error("ProcessMapPage requires phase 31, module process-map");
  return (
    <WorkRecordGovernance screen={screen} routes={enterpriseOperationsRoutes} namespace="phase31" scope="Process Map">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
