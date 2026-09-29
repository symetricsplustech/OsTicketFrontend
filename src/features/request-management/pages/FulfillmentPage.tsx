import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function FulfillmentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "fulfillment") throw new Error("FulfillmentPage requires phase 6, module fulfillment");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="Fulfillment"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}