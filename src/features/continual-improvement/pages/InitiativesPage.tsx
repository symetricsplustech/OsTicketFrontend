import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { improvementRoutes } from "../../model/improvementRoutes";

export function InitiativesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 21 || screen.module !== "initiatives") throw new Error("InitiativesPage requires phase 21, module initiatives");
  return (
    <WorkRecordGovernance screen={screen} routes={improvementRoutes} namespace="phase21" scope="Initiatives">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
