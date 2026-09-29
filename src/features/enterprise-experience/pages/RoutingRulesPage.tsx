import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { operationalRoutes } from "../../model/operationalRoutes";

export function RoutingRulesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "routing") throw new Error("RoutingRulesPage requires phase 11, module routing");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={operationalRoutes}
      namespace="phase11"
      scope="Routing Rules"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}