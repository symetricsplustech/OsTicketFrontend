import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { frontendGovernanceRoutes } from "../model/frontendGovernanceRoutes";

export function ListPersonalizationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 41 || screen.module !== "list-personalization") throw new Error("ListPersonalizationPage requires phase 41, module list-personalization");
  return (
    <WorkRecordGovernance screen={screen} routes={frontendGovernanceRoutes} namespace="phase41" scope="Frontend Governance, Personalization & Accessibility">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
