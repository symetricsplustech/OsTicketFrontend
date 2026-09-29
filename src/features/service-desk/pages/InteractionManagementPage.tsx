import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function InteractionManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "interactions") throw new Error("InteractionManagementPage requires phase 1, module interactions");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Interaction Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}