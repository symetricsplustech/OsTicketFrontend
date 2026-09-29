import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { notificationRoutes } from "../../model/notificationRoutes";

export function NotificationsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 33 || screen.module !== "notifications") throw new Error("NotificationsPage requires phase 33, module notifications");
  return (
    <WorkRecordGovernance screen={screen} routes={notificationRoutes} namespace="phase33" scope="Notifications">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
