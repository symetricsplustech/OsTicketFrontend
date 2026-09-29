import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function ApplicationServicesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "application-services") throw new Error("ApplicationServicesPage requires phase 14, module application-services");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="Application Services">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
