import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { requestRoutes } from "../../model/requestRoutes";

export function SCTASKPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 6 || screen.module !== "catalog-tasks") throw new Error("SCTASKPage requires phase 6, module catalog-tasks");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={requestRoutes}
      namespace="phase06"
      scope="SCTASK"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}