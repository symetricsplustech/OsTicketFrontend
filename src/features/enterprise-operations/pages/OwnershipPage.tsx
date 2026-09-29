import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function OwnershipPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "ownership") throw new Error("OwnershipPage requires phase 14, module ownership");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="Ownership">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
