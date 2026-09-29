import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../model/catalogRoutes";
export function CatalogManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7) throw new Error("CatalogManagementPage requires a Phase 07 route");
  return <WorkRecordGovernance screen={screen} routes={catalogRoutes} namespace="nexa.phase07" scope="Service Catalog"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
