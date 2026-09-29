import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function ServiceOwnerWorkspacePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "owner-workspace") throw new Error("ServiceOwnerWorkspacePage requires phase 14, module owner-workspace");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="Service Owner Workspace">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
