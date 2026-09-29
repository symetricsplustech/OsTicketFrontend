import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { conversationalServiceRoutes } from "../../model/conversationalServiceRoutes";

export function ITSMTopicsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 24 || screen.module !== "itsm-topics") throw new Error("ITSMTopicsPage requires phase 24, module itsm-topics");
  return (
    <WorkRecordGovernance screen={screen} routes={conversationalServiceRoutes} namespace="phase24" scope="ITSM Topics">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
