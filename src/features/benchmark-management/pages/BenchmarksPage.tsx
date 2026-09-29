import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { benchmarkManagementRoutes } from "../../model/benchmarkManagementRoutes";

export function BenchmarksPage({ screen }: { screen: ScreenDefinition }) {
  if (screen.phase !== 29 || screen.module !== "benchmarks") throw new Error("BenchmarksPage requires phase 29, module benchmarks");
  return (
    <WorkRecordGovernance screen={screen} routes={benchmarkManagementRoutes} namespace="phase29" scope="Benchmarks">
      <WorkRecordWorkspace screen={screen} />
    </WorkRecordGovernance>
  );
}
