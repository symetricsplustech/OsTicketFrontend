import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function KnowledgeArticlesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "articles") throw new Error("KnowledgeArticlesPage requires phase 9, module articles");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Knowledge Articles"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}