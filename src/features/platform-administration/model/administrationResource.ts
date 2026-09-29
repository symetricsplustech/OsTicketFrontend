import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import type { AdministrationResource } from "../api/platformAdministrationApi";

export function administrationResource(screen: ScreenDefinition): AdministrationResource | null {
  if (screen.module === "roles") return "roles";
  if (screen.module === "groups" || screen.module === "assignment-groups") return "teams";
  if (screen.module === "organization") {
    const title = screen.title.toLowerCase();
    if (title.includes("compan")) return "companies";
    if (title.includes("department")) return "departments";
    return "organization-units";
  }
  return null;
}

