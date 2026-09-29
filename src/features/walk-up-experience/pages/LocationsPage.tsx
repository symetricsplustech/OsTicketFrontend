import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { walkUpRoutes } from "../../model/walkUpRoutes";

export function LocationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 18 || screen.module !== "locations") throw new Error("LocationsPage requires phase 18, module locations");
  return (
    <WorkRecordGovernance screen={screen} routes={walkUpRoutes} namespace="phase18" scope="Walk-Up Experience">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
