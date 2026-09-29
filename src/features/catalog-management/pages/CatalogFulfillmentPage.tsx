import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function CatalogFulfillmentPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "fulfillment") throw new Error("CatalogFulfillmentPage requires phase 7, module fulfillment");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Catalog Fulfillment"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}