import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function KnowledgeBasesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "bases") throw new Error("KnowledgeBasesPage requires phase 9, module bases");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Knowledge Bases"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}