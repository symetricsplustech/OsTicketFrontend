import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { employeeCenterRoutes } from "../../model/employeeCenterRoutes";

export function KnowledgePage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 23 || screen.module !== "knowledge") throw new Error("KnowledgePage requires phase 23, module knowledge");
  return (
    <WorkRecordGovernance screen={screen} routes={employeeCenterRoutes} namespace="phase23" scope="Knowledge">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
