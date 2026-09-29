import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { improvementRoutes } from "../../model/improvementRoutes";

export function AssessmentsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 21 || screen.module !== "assessments") throw new Error("AssessmentsPage requires phase 21, module assessments");
  return (
    <WorkRecordGovernance screen={screen} routes={improvementRoutes} namespace="phase21" scope="Assessments">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
