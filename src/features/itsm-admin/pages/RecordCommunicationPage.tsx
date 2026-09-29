import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { notificationRoutes } from "../../model/notificationRoutes";

export function RecordCommunicationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 33 || screen.module !== "communication") throw new Error("RecordCommunicationPage requires phase 33, module communication");
  return (
    <WorkRecordGovernance screen={screen} routes={notificationRoutes} namespace="phase33" scope="Record Communication">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
