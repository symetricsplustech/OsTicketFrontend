import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function CatalogUIPoliciesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "ui-policies") throw new Error("CatalogUIPoliciesPage requires phase 7, module ui-policies");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Catalog UI Policies"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}