import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { universalRequestRoutes } from "../../model/universalRequestRoutes";

export function AgentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 8 || screen.module !== "agent") throw new Error("AgentPage requires phase 8, module agent");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={universalRequestRoutes}
      namespace="phase08"
      scope="Agent"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}