import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function PhoneVoiceIntakePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "voice") throw new Error("PhoneVoiceIntakePage requires phase 1, module voice");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Phone / Voice Intake"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}