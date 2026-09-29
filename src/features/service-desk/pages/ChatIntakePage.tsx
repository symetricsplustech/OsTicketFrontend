import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function ChatIntakePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "chat") throw new Error("ChatIntakePage requires phase 1, module chat");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Chat Intake"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}