import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ChangeHomePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "home") throw new Error("ChangeHomePage requires phase 5, module home");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Change Enablement"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}