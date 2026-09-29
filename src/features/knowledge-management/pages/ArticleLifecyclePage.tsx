import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function ArticleLifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "lifecycle") throw new Error("ArticleLifecyclePage requires phase 9, module lifecycle");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Article Lifecycle"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}