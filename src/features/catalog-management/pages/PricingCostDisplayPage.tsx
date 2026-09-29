import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function PricingCostDisplayPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "pricing") throw new Error("PricingCostDisplayPage requires phase 7, module pricing");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Pricing & Cost Display"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}