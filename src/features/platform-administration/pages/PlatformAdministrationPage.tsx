import { useLocation } from "react-router-dom";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { AdministrationWorkspace } from "../components/AdministrationWorkspace";

export function PlatformAdministrationPage({ screen }: { screen: ScreenDefinition }) {
  const location = useLocation();
  const instanceId = location.pathname.split("/")[2] || "";
  return <AdministrationWorkspace screen={screen} instanceId={instanceId} />;
}
