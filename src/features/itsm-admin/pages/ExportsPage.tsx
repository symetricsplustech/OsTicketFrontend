import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { reportingRoutes } from "../model/reportingRoutes";

export function ExportsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 32 || screen.module !== "exports") throw new Error("ExportsPage requires phase 32, module exports");
  return (
    <WorkRecordGovernance screen={screen} routes={reportingRoutes} namespace="phase32" scope="Exports">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
