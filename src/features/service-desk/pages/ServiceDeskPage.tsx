import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../model/serviceDeskRoutes";

export function ServiceDeskPage({ screen }: { screen: ScreenDefinition }) {
  return <WorkRecordGovernance screen={screen} routes={serviceDeskRoutes} namespace="phase01" scope="Service Desk"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
