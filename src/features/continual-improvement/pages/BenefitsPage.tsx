import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { improvementRoutes } from "../../model/improvementRoutes";

export function BenefitsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 21 || screen.module !== "benefits") throw new Error("BenefitsPage requires phase 21, module benefits");
  return (
    <WorkRecordGovernance screen={screen} routes={improvementRoutes} namespace="phase21" scope="Benefits">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
