import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function MyItemsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "my-items") throw new Error("MyItemsPage requires phase 23, module my-items");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="My Items">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
