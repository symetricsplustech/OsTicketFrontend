import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { experienceFeedbackRoutes } from "../model/experienceFeedbackRoutes";

export function CSATPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 28 || screen.module !== "csat") throw new Error("CSATPage requires phase 28, module csat");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={experienceFeedbackRoutes}
      namespace="phase28"
      scope="Surveys, Assessments & Experience Feedback"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
