import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { csdmRoutes } from "../../model/csdmRoutes";

export function BusinessServicesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 14 || screen.module !== "business-services") throw new Error("BusinessServicesPage requires phase 14, module business-services");
  return (
    <WorkRecordGovernance screen={screen} routes={csdmRoutes} namespace="phase14" scope="Business Services">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
