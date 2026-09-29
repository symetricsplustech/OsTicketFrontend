import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function REQPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "requests") throw new Error("REQPage requires phase 6, module requests");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="REQ"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}