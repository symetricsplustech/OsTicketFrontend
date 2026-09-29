import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function ProblemQueuesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "queues") throw new Error("ProblemQueuesPage requires phase 4, module queues");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Problem Queues"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}