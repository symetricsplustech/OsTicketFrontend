import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function EscalationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "escalations") throw new Error("EscalationsPage requires phase 10, module escalations");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="Escalations"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}