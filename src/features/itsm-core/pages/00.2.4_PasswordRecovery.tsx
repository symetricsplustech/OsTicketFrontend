import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { instanceRoutes } from "../../model/instanceRoutes";

export function PasswordRecoveryPage({ screen }: { screen: ScreenDefinition }) {
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={instanceRoutes}
      namespace="phase00"
      scope="Identity"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}