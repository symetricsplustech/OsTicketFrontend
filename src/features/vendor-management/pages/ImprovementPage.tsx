import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { vendorRoutes } from "../model/vendorRoutes";

export function ImprovementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 27 || screen.module !== "improvement") throw new Error("ImprovementPage requires phase 27, module improvement");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={vendorRoutes}
      namespace="phase27"
      scope="Vendor Manager Workspace"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
