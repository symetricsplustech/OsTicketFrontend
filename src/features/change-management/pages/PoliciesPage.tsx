import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { devopsChangeRoutes } from "../model/devopsChangeRoutes";

export function PoliciesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 35 || screen.module !== "policies") throw new Error("PoliciesPage requires phase 35, module policies");
  return (
    <WorkRecordGovernance screen={screen} routes={devopsChangeRoutes} namespace="phase35" scope="Policies">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
