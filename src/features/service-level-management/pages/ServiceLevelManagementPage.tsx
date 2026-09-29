import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../model/serviceLevelRoutes";
export function ServiceLevelManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10) throw new Error("ServiceLevelManagementPage requires a Phase 10 route");
  return <WorkRecordGovernance screen={screen} routes={serviceLevelRoutes} namespace="nexa.phase10" scope="Service Level Management"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
