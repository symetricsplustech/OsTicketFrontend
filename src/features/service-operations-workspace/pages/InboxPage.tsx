import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function InboxPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "inbox") throw new Error("InboxPage requires phase 22, module inbox");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Inbox">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
