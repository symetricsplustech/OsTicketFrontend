import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { universalRequestRoutes } from "../../model/universalRequestRoutes";

export function UniversalRequestHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 8 || screen.module !== "home") throw new Error("UniversalRequestHomePage requires phase 8, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={universalRequestRoutes}
      namespace="phase08"
      scope="Universal Request"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}