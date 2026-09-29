import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { catalogRoutes } from "../../model/catalogRoutes";

export function CategoriesPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 7 || screen.module !== "categories") throw new Error("CategoriesPage requires phase 7, module categories");
  return (
    <WorkRecordGovernance
      screen={screen}
      routes={catalogRoutes}
      namespace="phase07"
      scope="Categories"
    >
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}