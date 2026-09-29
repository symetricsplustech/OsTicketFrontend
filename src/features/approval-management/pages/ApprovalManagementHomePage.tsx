import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { approvalManagementRoutes } from "../../model/approvalManagementRoutes";

export function ApprovalManagementHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 12 || screen.module !== "home") throw new Error("ApprovalManagementHomePage requires phase 12, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={approvalManagementRoutes}
      namespace="phase12"
      scope="Approval Management"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}