import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { devopsChangeRoutes } from "../model/devopsChangeRoutes";

export function AuditPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 35 || screen.module !== "audit") throw new Error("AuditPage requires phase 35, module audit");
  return (
    <WorkRecordGovernance screen={screen} routes={devopsChangeRoutes} namespace="phase35" scope="Audit">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
