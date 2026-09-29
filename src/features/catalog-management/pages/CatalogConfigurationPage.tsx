import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function CatalogConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "configuration") throw new Error("CatalogConfigurationPage requires phase 7, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Catalog Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}