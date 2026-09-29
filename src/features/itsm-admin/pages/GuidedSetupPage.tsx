import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { adminCenterRoutes } from "../../model/adminCenterRoutes";

export function GuidedSetupPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 40 || screen.module !== "guided-setup") throw new Error("GuidedSetupPage requires phase 40, module guided-setup");
  return (
    <WorkRecordGovernance screen={screen} routes={adminCenterRoutes} namespace="phase40" scope="ITSM Administration Center">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
