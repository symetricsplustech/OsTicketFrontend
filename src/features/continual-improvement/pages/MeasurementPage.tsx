import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { improvementRoutes } from "../../model/improvementRoutes";

export function MeasurementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 21 || screen.module !== "measurement") throw new Error("MeasurementPage requires phase 21, module measurement");
  return (
    <WorkRecordGovernance screen={screen} routes={improvementRoutes} namespace="phase21" scope="Measurement">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
