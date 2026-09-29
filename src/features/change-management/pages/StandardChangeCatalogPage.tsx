import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function StandardChangeCatalogPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "standard-catalog") throw new Error("StandardChangeCatalogPage requires phase 5, module standard-catalog");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Standard Change Catalog"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}