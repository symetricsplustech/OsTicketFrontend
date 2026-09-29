import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function SLAReportingPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "reporting") throw new Error("SLAReportingPage requires phase 10, module reporting");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="SLA Reporting"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}