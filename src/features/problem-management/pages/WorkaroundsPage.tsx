import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { problemRoutes } from "../../model/problemRoutes";

export function WorkaroundsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 4 || screen.module !== "workarounds") throw new Error("WorkaroundsPage requires phase 4, module workarounds");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={problemRoutes}
      namespace="phase04"
      scope="Workarounds"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}