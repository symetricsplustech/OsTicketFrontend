import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { onCallRoutes } from "../../model/onCallRoutes";

export function RotationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 17 || screen.module !== "rotations") throw new Error("RotationsPage requires phase 17, module rotations");
  return (
    <WorkRecordGovernance screen={screen} routes={onCallRoutes} namespace="phase17" scope="On-Call Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
