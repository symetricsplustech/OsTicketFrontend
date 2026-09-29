import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { outageRoutes } from "../../model/outageRoutes";

export function OutagesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 16 || screen.module !== "outages") throw new Error("OutagesPage requires phase 16, module outages");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={outageRoutes}
      namespace="phase16"
      scope="Outages"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}