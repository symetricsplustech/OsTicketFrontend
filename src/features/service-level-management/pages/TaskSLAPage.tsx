import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function TaskSLAPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "task-sla") throw new Error("TaskSLAPage requires phase 10, module task-sla");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="Task SLA"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}