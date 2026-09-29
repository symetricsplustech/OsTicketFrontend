import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { lifecycleRoutes } from "../model/lifecycleRoutes";

export function CIServiceLifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 42 || screen.module !== "ci-service") throw new Error("CIServiceLifecyclePage requires phase 42, module ci-service");
  return (
    <WorkRecordGovernance screen={screen} routes={lifecycleRoutes} namespace="phase42" scope="End-to-End ITSM Lifecycle & Acceptance">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
