import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function CSDMFoundationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "foundation") throw new Error("CSDMFoundationPage requires phase 14, module foundation");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="CSDM Foundation">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
