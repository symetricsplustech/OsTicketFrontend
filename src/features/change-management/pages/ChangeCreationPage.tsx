import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ChangeCreationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "creation") throw new Error("ChangeCreationPage requires phase 5, module creation");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Change Creation"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}