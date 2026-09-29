import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
import { experienceSuite21 } from "./catalogs/experienceSuite21";
import { experienceSuite22 } from "./catalogs/experienceSuite22";
import { experienceSuite23 } from "./catalogs/experienceSuite23";
import { experienceSuite24 } from "./catalogs/experienceSuite24";
import { experienceSuite25 } from "./catalogs/experienceSuite25";
import { experienceSuite26 } from "./catalogs/experienceSuite26";
import { experienceSuite27 } from "./catalogs/experienceSuite27";
import { experienceSuite28 } from "./catalogs/experienceSuite28";
import { experienceSuite29 } from "./catalogs/experienceSuite29";
import { experienceSuite30 } from "./catalogs/experienceSuite30";

export type EnterpriseExperienceRoute = ScreenDefinition & { group: string };
type ExperienceSuite = { phase: number; title: string; modules: readonly { title: string; screens: readonly string[] }[] };

const experienceSuites: readonly ExperienceSuite[] = [experienceSuite21, experienceSuite22, experienceSuite23, experienceSuite24, experienceSuite25, experienceSuite26, experienceSuite27, experienceSuite28, experienceSuite29, experienceSuite30];

const slugify = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard|overview|analytics|performance|health|timeline|calendar|map|insights|status$/i.test(title) ? "dashboard" : /create|new |builder|designer|configuration|setup|book|submit|compose|test|edit/i.test(title) ? "settings" : /record|detail|profile|context|history|result|review|conversation|session/i.test(title) ? "record" : "list";

export const enterpriseExperienceRoutes: EnterpriseExperienceRoute[] = experienceSuites.flatMap((suite) => suite.modules.flatMap((operationModule, moduleIndex) => operationModule.screens.map((title, screenIndex) => ({
  id: suite.phase * 100000 + (moduleIndex + 1) * 100 + screenIndex + 1,
  title,
  path: `/instances/:instanceId/experience/${slugify(suite.title)}/${slugify(operationModule.title)}/${slugify(title)}`,
  group: `${suite.title} · ${operationModule.title}`,
  phase: suite.phase,
  kind: kindFor(title),
  area: operationModule.title,
  module: slugify(operationModule.title),
  screenId: `${suite.phase}.${moduleIndex + 1}.${screenIndex + 1}`,
  description: `${title} with tenant-scoped API data, permission-aware lifecycle actions, nested context, audit evidence, and responsive states.`,
}))));
