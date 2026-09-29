import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function CatalogPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "catalog") throw new Error("CatalogPage requires phase 23, module catalog");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Catalog">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
