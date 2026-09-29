import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { onCallRoutes } from "../../model/onCallRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 17 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 17, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={onCallRoutes} namespace="phase17" scope="On-Call Management">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
