import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { outageRoutes } from "../../model/outageRoutes";

export function OutageCommunicationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 16 || screen.module !== "outage-communications") throw new Error("OutageCommunicationsPage requires phase 16, module outage-communications");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={outageRoutes}
      namespace="phase16"
      scope="Outage Communications"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
