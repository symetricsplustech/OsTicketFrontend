import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { conversationalServiceRoutes } from "../../model/conversationalServiceRoutes";

export function LiveAgentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 24 || screen.module !== "live-agent") throw new Error("LiveAgentPage requires phase 24, module live-agent");
  return (
    <WorkRecordGovernance screen={screen} routes={conversationalServiceRoutes} namespace="phase24" scope="Live Agent">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
