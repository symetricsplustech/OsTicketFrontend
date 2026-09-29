import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { ExperienceWorkspace } from "../components/ExperienceWorkspace";

export function EnterpriseExperiencePage({ screen }: { screen: ScreenDefinition }) {
  return <ExperienceWorkspace screen={screen} />;
}
