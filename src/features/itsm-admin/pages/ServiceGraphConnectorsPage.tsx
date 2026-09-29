import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { integrationRoutes } from "../../model/integrationRoutes";

export function ServiceGraphConnectorsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 37 || screen.module !== "service-graph") throw new Error("ServiceGraphConnectorsPage requires phase 37, module service-graph");
  return (
    <WorkRecordGovernance screen={screen} routes={integrationRoutes} namespace="phase37" scope="Integrations, Data Fabric & Service Graph Connectors">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
