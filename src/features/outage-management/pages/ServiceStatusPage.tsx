import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { outageRoutes } from "../../model/outageRoutes";

export function ServiceStatusPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 16 || screen.module !== "service-status") throw new Error("ServiceStatusPage requires phase 16, module service-status");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={outageRoutes}
      namespace="phase16"
      scope="Service Status"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}