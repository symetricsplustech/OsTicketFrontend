import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { approvalManagementRoutes } from "../../model/approvalManagementRoutes";

export function EscalationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 12 || screen.module !== "escalation") throw new Error("EscalationPage requires phase 12, module escalation");
  return (
    <WorkRecordGovernance screen={screen} routes={approvalManagementRoutes} namespace="phase12" scope="Escalation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}