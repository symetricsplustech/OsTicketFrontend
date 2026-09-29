import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { serviceLevelRoutes } from "../../model/serviceLevelRoutes";

export function OLADefinitionsPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 10 || screen.module !== "ola-definitions") throw new Error("OLADefinitionsPage requires phase 10, module ola-definitions");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={serviceLevelRoutes}
      namespace="phase10"
      scope="OLA Definitions"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}