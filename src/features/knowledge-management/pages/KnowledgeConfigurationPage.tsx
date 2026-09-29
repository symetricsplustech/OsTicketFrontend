import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { knowledgeRoutes } from "../../model/knowledgeRoutes";

export function KnowledgeConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 9 || screen.module !== "configuration") throw new Error("KnowledgeConfigurationPage requires phase 9, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={knowledgeRoutes}
      namespace="phase09"
      scope="Knowledge Configuration"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}