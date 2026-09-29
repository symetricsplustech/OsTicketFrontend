import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { lifecycleRoutes } from "../model/lifecycleRoutes";

export function ChangeLifecyclePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 42 || screen.module !== "change") throw new Error("ChangeLifecyclePage requires phase 42, module change");
  return (
    <WorkRecordGovernance screen={screen} routes={lifecycleRoutes} namespace="phase42" scope="End-to-End ITSM Lifecycle & Acceptance">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
