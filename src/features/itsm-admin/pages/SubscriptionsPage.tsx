import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { notificationRoutes } from "../../model/notificationRoutes";

export function SubscriptionsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 33 || screen.module !== "subscriptions") throw new Error("SubscriptionsPage requires phase 33, module subscriptions");
  return (
    <WorkRecordGovernance screen={screen} routes={notificationRoutes} namespace="phase33" scope="Subscriptions">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
