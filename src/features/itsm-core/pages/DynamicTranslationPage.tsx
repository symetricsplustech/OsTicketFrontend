import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { translationRoutes } from "../model/translationRoutes";

export function DynamicTranslationPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 39 || screen.module !== "dynamic-translation") throw new Error("DynamicTranslationPage requires phase 39, module dynamic-translation");
  return (
    <WorkRecordGovernance screen={screen} routes={translationRoutes} namespace="phase39" scope="Dynamic Translation & Localization">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
