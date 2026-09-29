import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function KnowledgeCategoriesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "categories") throw new Error("KnowledgeCategoriesPage requires phase 9, module categories");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Knowledge Categories"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}