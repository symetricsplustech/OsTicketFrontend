import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function CatalogsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "catalogs") throw new Error("CatalogsPage requires phase 7, module catalogs");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Catalogs"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}