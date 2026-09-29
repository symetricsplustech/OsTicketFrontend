import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { changeRoutes } from "../../model/changeRoutes";

export function ChangeCalendarPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 5 || screen.module !== "calendar") throw new Error("ChangeCalendarPage requires phase 5, module calendar");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={changeRoutes}
      namespace="phase05"
      scope="Change Calendar"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}