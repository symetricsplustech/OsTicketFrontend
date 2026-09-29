import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { OperationalWorkspace } from "../components/OperationalWorkspace";

export function EnterpriseOperationsPage({ screen }: { screen: ScreenDefinition }) {
  return <OperationalWorkspace screen={screen} />;
}
