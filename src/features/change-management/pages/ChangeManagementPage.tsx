import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../model/changeRoutes";

export function ChangeManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5)
    throw new Error("ChangeManagementPage requires a Phase 05 route");
  return <WorkRecordGovernance screen={screen} routes={changeRoutes} namespace="nexa.phase05" scope="Change Enablement"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
