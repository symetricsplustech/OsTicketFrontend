import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { experienceFeedbackRoutes } from "../model/experienceFeedbackRoutes";

export function SurveysPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 28 || screen.module !== "surveys") throw new Error("SurveysPage requires phase 28, module surveys");
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
