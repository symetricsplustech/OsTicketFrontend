import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { approvalManagementRoutes } from "../../model/approvalManagementRoutes";

export function ApprovalPoliciesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 12 || screen.module !== "approval-policies") throw new Error("ApprovalPoliciesPage requires phase 12, module approval-policies");
  return (
    <WorkRecordGovernance screen={screen} routes={approvalManagementRoutes} namespace="phase12" scope="Approval Policies">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}