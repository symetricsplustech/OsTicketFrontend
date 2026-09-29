import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../model/knowledgeRoutes";
export function KnowledgeManagementPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9) throw new Error("KnowledgeManagementPage requires a Phase 09 route");
  return <WorkRecordGovernance screen={screen} routes={knowledgeRoutes} namespace="nexa.phase09" scope="Knowledge Management"><WorkRecordWorkspace screen={screen} /></WorkRecordGovernance>;
}
