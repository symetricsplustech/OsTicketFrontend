import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function ListsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "lists") throw new Error("ListsPage requires phase 22, module lists");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Lists">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
