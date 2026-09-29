import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function SLAHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "sla-definitions") throw new Error("SLAHomePage requires phase 10, module sla-definitions");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="Service Level Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}