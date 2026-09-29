import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { majorIncidentRoutes } from "../model/majorIncidentRoutes";

export function MajorIncidentManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 3) throw new Error("MajorIncidentManagementPage requires a Phase 03 route");
  return <WorkRecordGovernance screen={screen} routes={majorIncidentRoutes} namespace="nexa.phase03" scope="Major Incident Management"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
