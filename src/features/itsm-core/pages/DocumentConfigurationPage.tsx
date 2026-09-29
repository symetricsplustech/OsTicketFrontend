import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { documentIntelligenceRoutes } from "../model/documentIntelligenceRoutes";

export function DocumentConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 38 || screen.module !== "configuration") throw new Error("DocumentConfigurationPage requires phase 38, module configuration");
  return (
    <WorkRecordGovernance screen={screen} routes={documentIntelligenceRoutes} namespace="phase38" scope="Document Intelligence & Attachments">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
