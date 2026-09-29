import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function InteractionConversionPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "conversion") throw new Error("InteractionConversionPage requires phase 1, module conversion");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Interaction Conversion"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}