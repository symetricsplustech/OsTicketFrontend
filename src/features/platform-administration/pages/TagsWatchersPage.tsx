import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { frontendGovernanceRoutes } from "../model/frontendGovernanceRoutes";

export function TagsWatchersPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 41 || screen.module !== "tags-watchers") throw new Error("TagsWatchersPage requires phase 41, module tags-watchers");
  return (
    <WorkRecordGovernance screen={screen} routes={frontendGovernanceRoutes} namespace="phase41" scope="Frontend Governance, Personalization & Accessibility">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
