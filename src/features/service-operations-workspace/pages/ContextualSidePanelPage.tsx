import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceOperationsRoutes } from "../../model/serviceOperationsRoutes";

export function ContextualSidePanelPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 22 || screen.module !== "side-panel") throw new Error("ContextualSidePanelPage requires phase 22, module side-panel");
  return (
    <WorkRecordGovernance screen={screen} routes={serviceOperationsRoutes} namespace="phase22" scope="Contextual Side Panel">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
