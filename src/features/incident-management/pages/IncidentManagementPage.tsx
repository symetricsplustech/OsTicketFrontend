import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { incidentRoutes } from "../model/incidentRoutes";

export function IncidentManagementPage({ screen }: { screen: ScreenDefinition }) {
  return <WorkRecordGovernance screen={screen} routes={incidentRoutes} namespace="phase02" scope="Incident Management"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
