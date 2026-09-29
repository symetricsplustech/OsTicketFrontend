import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { enterpriseOperationsRoutes } from "../model/enterpriseOperationsRoutes";

export function ProcessMiningHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 31 || screen.module !== "home") throw new Error("ProcessMiningHomePage requires phase 31, module home");
  return (
    <WorkRecordGovernance screen={screen} routes={enterpriseOperationsRoutes} namespace="phase31" scope="Process Mining / Process Optimization">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
