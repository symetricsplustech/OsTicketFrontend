import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { notificationRoutes } from "../../model/notificationRoutes";

export function TemplatesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 33 || screen.module !== "templates") throw new Error("TemplatesPage requires phase 33, module templates");
  return (
    <WorkRecordGovernance screen={screen} routes={notificationRoutes} namespace="phase33" scope="Templates">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
