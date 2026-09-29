import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { improvementRoutes } from "../../model/improvementRoutes";

export function TasksPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 21 || screen.module !== "tasks") throw new Error("TasksPage requires phase 21, module tasks");
  return (
    <WorkRecordGovernance screen={screen} routes={improvementRoutes} namespace="phase21" scope="Tasks">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
