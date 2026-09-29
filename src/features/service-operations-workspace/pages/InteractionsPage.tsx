import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function InteractionsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "interactions") throw new Error("InteractionsPage requires phase 22, module interactions");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Interactions">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
