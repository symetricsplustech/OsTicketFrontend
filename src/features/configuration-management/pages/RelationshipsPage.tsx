import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { configurationManagementRoutes } from "../../model/configurationManagementRoutes";

export function RelationshipsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 13 || screen.module !== "relationships") throw new Error("RelationshipsPage requires phase 13, module relationships");
  return (
    <WorkRecordGovernance screen={screen} routes={configurationManagementRoutes} namespace="phase13" scope="Relationships">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
