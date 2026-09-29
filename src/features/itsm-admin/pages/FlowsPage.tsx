import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { automationRoutes } from "../../model/automationRoutes";

export function FlowsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 36 || screen.module !== "flows") throw new Error("FlowsPage requires phase 36, module flows");
  return (
    <WorkRecordGovernance screen={screen} routes={automationRoutes} namespace="phase36" scope="Flows">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
