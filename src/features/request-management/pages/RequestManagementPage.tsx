import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../model/requestRoutes";
export function RequestManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6) throw new Error("RequestManagementPage requires a Phase 06 route");
  return <WorkRecordGovernance screen={screen} routes={requestRoutes} namespace="nexa.phase06" scope="Request Fulfillment"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
