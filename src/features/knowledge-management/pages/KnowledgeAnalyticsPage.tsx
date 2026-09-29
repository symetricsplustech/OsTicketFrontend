import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function KnowledgeAnalyticsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "analytics") throw new Error("KnowledgeAnalyticsPage requires phase 9, module analytics");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Knowledge Analytics"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}