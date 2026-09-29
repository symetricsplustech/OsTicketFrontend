import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { vendorRoutes } from "../model/vendorRoutes";

export function AssessmentsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 27 || screen.module !== "assessments") throw new Error("AssessmentsPage requires phase 27, module assessments");
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
