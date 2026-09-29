import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function CalendarsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "calendars") throw new Error("CalendarsPage requires phase 10, module calendars");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="Calendars"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}