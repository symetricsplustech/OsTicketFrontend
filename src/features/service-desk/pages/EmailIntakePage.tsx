import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceDeskRoutes } from "../../model/serviceDeskRoutes";

export function EmailIntakePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 1 || screen.module !== "email") throw new Error("EmailIntakePage requires phase 1, module email");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceDeskRoutes}
      namespace="phase01"
      scope="Email Intake"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}