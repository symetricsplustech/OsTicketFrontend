import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { operationalRoutes } from "../../model/operationalRoutes";

export function CapacityPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "capacity") throw new Error("CapacityPage requires phase 11, module capacity");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={operationalRoutes}
      namespace="phase11"
      scope="Capacity"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}