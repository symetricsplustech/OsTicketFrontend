import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../model/problemRoutes";

export function ProblemManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4) throw new Error("ProblemManagementPage requires a Phase 04 route");
  return <WorkRecordGovernance screen={screen} routes={problemRoutes} namespace="nexa.phase04" scope="Problem Management"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
