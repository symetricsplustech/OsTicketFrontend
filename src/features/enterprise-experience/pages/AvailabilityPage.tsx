import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { operationalRoutes } from "../../model/operationalRoutes";

export function AvailabilityPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "availability") throw new Error("AvailabilityPage requires phase 11, module availability");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={operationalRoutes}
      namespace="phase11"
      scope="Availability"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}