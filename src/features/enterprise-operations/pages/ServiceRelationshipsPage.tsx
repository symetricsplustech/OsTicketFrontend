import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function ServiceRelationshipsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "relationships") throw new Error("ServiceRelationshipsPage requires phase 14, module relationships");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="Service Relationships">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
