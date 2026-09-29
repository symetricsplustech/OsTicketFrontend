import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { conversationalServiceRoutes } from "../../model/conversationalServiceRoutes";

export function VoiceAgentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 24 || screen.module !== "voice-agent") throw new Error("VoiceAgentPage requires phase 24, module voice-agent");
  return (
    <WorkRecordGovernance screen={screen} routes={conversationalServiceRoutes} namespace="phase24" scope="Voice Agent">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
