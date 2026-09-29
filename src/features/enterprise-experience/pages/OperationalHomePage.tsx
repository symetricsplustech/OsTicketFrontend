import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { operationalRoutes } from "../../model/operationalRoutes";

export function OperationalHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 11 || screen.module !== "home") throw new Error("OperationalHomePage requires phase 11, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={operationalRoutes}
      namespace="phase11"
      scope="Assignment, Routing, Skills & Queues"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}