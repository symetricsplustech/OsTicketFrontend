import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function PortalIntakePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "portal") throw new Error("PortalIntakePage requires phase 1, module portal");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Portal Intake"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}