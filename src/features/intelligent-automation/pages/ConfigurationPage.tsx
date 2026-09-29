import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { intelligentAutomationRoutes } from "../model/intelligentAutomationRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 25 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 25, module configuration");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={intelligentAutomationRoutes}
      namespace="phase25"
      scope="AI Search, Predictive Intelligence, Task Intelligence & Now Assist"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
