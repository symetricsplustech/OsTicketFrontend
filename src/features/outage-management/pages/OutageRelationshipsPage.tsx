import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { outageRoutes } from "../../model/outageRoutes";

export function OutageRelationshipsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 16 || screen.module !== "outage-relationships") throw new Error("OutageRelationshipsPage requires phase 16, module outage-relationships");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={outageRoutes}
      namespace="phase16"
      scope="Outage Relationships"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}