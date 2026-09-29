import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { experienceFeedbackRoutes } from "../model/experienceFeedbackRoutes";

export function ConfigurationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 28 || screen.module !== "configuration") throw new Error("ConfigurationPage requires phase 28, module configuration");
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
