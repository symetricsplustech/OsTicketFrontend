import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { devopsChangeRoutes } from "../model/devopsChangeRoutes";

export function ConnectionsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 35 || screen.module !== "connections") throw new Error("ConnectionsPage requires phase 35, module connections");
  return (
    <WorkRecordGovernance screen={screen} routes={devopsChangeRoutes} namespace="phase35" scope="Connections">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
