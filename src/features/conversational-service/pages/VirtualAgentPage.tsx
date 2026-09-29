import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { conversationalServiceRoutes } from "../../model/conversationalServiceRoutes";

export function VirtualAgentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 24 || screen.module !== "virtual-agent") throw new Error("VirtualAgentPage requires phase 24, module virtual-agent");
  return (
    <WorkRecordGovernance screen={screen} routes={conversationalServiceRoutes} namespace="phase24" scope="Virtual Agent">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
