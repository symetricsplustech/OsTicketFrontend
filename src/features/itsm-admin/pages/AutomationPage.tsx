import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { automationRoutes } from "../../model/automationRoutes";

export function AutomationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 36 || screen.module !== "automation") throw new Error("AutomationPage requires phase 36, module automation");
  return (
    <WorkRecordGovernance screen={screen} routes={automationRoutes} namespace="phase36" scope="Automation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
