import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { documentIntelligenceRoutes } from "../model/documentIntelligenceRoutes";

export function DocumentIntakePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 38 || screen.module !== "intake") throw new Error("DocumentIntakePage requires phase 38, module intake");
  return (
    <WorkRecordGovernance screen={screen} routes={documentIntelligenceRoutes} namespace="phase38" scope="Document Intelligence & Attachments">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
