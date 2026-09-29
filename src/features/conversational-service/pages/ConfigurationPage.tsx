import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { conversationalServiceRoutes } from "../../model/conversationalServiceRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 24 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 24, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={conversationalServiceRoutes} namespace="phase24" scope="Configuration">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
