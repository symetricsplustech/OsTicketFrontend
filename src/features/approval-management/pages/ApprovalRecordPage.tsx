import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { approvalManagementRoutes } from "../../model/approvalManagementRoutes";

export function ApprovalRecordPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 12 || screen.module !== "approval-record") throw new Error("ApprovalRecordPage requires phase 12, module approval-record");
  return (
    <WorkRecordGovernance screen={screen} routes={approvalManagementRoutes} namespace="phase12" scope="Approval Record">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}