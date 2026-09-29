import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { outageRoutes } from "../../model/outageRoutes";

export function OutageImpactPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 16 || screen.module !== "outage-impact") throw new Error("OutageImpactPage requires phase 16, module outage-impact");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={outageRoutes}
      namespace="phase16"
      scope="Outage Impact"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}