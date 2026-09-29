import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { automationRoutes } from "../../model/automationRoutes";

export function TaskAutomationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 36 || screen.module !== "task-automation") throw new Error("TaskAutomationPage requires phase 36, module task-automation");
  return (
    <WorkRecordGovernance screen={screen} routes={automationRoutes} namespace="phase36" scope="Task Automation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
