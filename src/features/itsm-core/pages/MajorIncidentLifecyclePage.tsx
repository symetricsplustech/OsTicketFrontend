import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { lifecycleRoutes } from "../model/lifecycleRoutes";

export function MajorIncidentLifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 42 || screen.module !== "major-incident") throw new Error("MajorIncidentLifecyclePage requires phase 42, module major-incident");
  return (
    <WorkRecordGovernance screen={screen} routes={lifecycleRoutes} namespace="phase42" scope="End-to-End ITSM Lifecycle & Acceptance">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
