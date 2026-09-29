import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { integrationRoutes } from "../../model/integrationRoutes";

export function ConnectionsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 37 || screen.module !== "connections") throw new Error("ConnectionsPage requires phase 37, module connections");
  return (
    <WorkRecordGovernance screen={screen} routes={integrationRoutes} namespace="phase37" scope="Integrations, Data Fabric & Service Graph Connectors">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
