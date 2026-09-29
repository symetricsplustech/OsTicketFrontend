import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { vendorRoutes } from "../model/vendorRoutes";

export function VendorServicesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 27 || screen.module !== "vendor-services") throw new Error("VendorServicesPage requires phase 27, module vendor-services");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={vendorRoutes}
      namespace="phase27"
      scope="Vendor Manager Workspace"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
