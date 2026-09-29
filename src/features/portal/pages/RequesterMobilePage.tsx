import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { mobileRoutes } from "../../model/mobileRoutes";

export function RequesterMobilePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 34 || screen.module !== "requester") throw new Error("RequesterMobilePage requires phase 34, module requester");
  return (
    <WorkRecordGovernance screen={screen} routes={mobileRoutes} namespace="phase34" scope="Requester Mobile">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
