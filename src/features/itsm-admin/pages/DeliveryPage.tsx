import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { notificationRoutes } from "../../model/notificationRoutes";

export function DeliveryPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 33 || screen.module !== "delivery") throw new Error("DeliveryPage requires phase 33, module delivery");
  return (
    <WorkRecordGovernance screen={screen} routes={notificationRoutes} namespace="phase33" scope="Delivery">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
