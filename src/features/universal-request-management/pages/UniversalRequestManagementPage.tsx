import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { universalRequestRoutes } from "../model/universalRequestRoutes";
export function UniversalRequestManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 8) throw new Error("UniversalRequestManagementPage requires a Phase 08 route");
  return <WorkRecordGovernance screen={screen} routes={universalRequestRoutes} namespace="nexa.phase08" scope="Universal Request"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
