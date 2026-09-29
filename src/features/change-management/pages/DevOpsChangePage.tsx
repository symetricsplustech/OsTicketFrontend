import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { devopsChangeRoutes } from "../model/devopsChangeRoutes";

export function DevOpsChangePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 35 || screen.module !== "devops") throw new Error("DevOpsChangePage requires phase 35, module devops");
  return (
    <WorkRecordGovernance screen={screen} routes={devopsChangeRoutes} namespace="phase35" scope="DevOps Change">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
