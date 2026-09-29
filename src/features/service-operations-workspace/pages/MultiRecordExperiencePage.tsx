import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function MultiRecordExperiencePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "multi-record") throw new Error("MultiRecordExperiencePage requires phase 22, module multi-record");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Multi-Record Experience">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
