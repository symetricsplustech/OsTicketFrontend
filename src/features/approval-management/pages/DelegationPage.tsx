import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { approvalManagementRoutes } from "../../model/approvalManagementRoutes";

export function DelegationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 12 || screen.module !== "delegation") throw new Error("DelegationPage requires phase 12, module delegation");
  return (
    <WorkRecordGovernance screen={screen} routes={approvalManagementRoutes} namespace="phase12" scope="Delegation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}