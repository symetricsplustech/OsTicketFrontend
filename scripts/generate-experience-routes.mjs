import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specificationPath = resolve(packageRoot, "..", "SERVICENOW_ITSM_FULL_COMPREHENSIVE_FRONTEND_UI_IMPLEMENTATION_MASTER.md");
const modelPath = resolve(packageRoot, "src/features/enterprise-experience/model");
const catalogPath = resolve(modelPath, "catalogs");
const outputPath = resolve(modelPath, "enterpriseExperienceRoutes.ts");
const source = readFileSync(specificationPath, "utf8");
const phaseStart = source.indexOf("PHASE 21 —", 10000);
const phaseEnd = source.indexOf("PHASE 31 —", phaseStart);
const start = source.lastIndexOf("\n#", phaseStart) + 1;
const end = source.lastIndexOf("\n#", phaseEnd) + 1;
if (start < 0 || end < 0) throw new Error("Unable to locate experience specification boundaries");

const suites = [];
let suite;
let module;
for (const line of source.slice(start, end).split("\n")) {
  const phaseMatch = line.match(/^# .*PHASE (2[1-9]|30) — (.+)$/);
  if (phaseMatch) { suite = { phase: Number(phaseMatch[1]), title: phaseMatch[2], modules: [] }; suites.push(suite); module = undefined; continue; }
  const moduleMatch = line.match(/^## .*Module (2[1-9]|30)\.\d+ — (.+)$/);
  if (moduleMatch && suite) { module = { title: moduleMatch[2], screens: [] }; suite.modules.push(module); continue; }
  const screenMatch = line.match(/^### .*Screen (?:2[1-9]|30)\.\d+\.\d+ — (.+)$/);
  if (screenMatch && module) module.screens.push(screenMatch[1]);
}

mkdirSync(catalogPath, { recursive: true });
const identifiers = [];
for (const item of suites) {
  const identifier = `experienceSuite${item.phase}`;
  identifiers.push(identifier);
  const data = JSON.stringify(item, null, 2).replace(/"([^"\\]+)":/g, "$1:");
  writeFileSync(resolve(catalogPath, `experienceSuite${item.phase}.ts`), `export const ${identifier} = ${data} as const;\n`);
}

const imports = identifiers.map((identifier, index) => `import { ${identifier} } from "./catalogs/experienceSuite${suites[index].phase}";`).join("\n");
const generated = `import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
${imports}

export type EnterpriseExperienceRoute = ScreenDefinition & { group: string };
type ExperienceSuite = { phase: number; title: string; modules: readonly { title: string; screens: readonly string[] }[] };

const experienceSuites: readonly ExperienceSuite[] = [${identifiers.join(", ")}];

const slugify = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard|overview|analytics|performance|health|timeline|calendar|map|insights|status$/i.test(title) ? "dashboard" : /create|new |builder|designer|configuration|setup|book|submit|compose|test|edit/i.test(title) ? "settings" : /record|detail|profile|context|history|result|review|conversation|session/i.test(title) ? "record" : "list";

export const enterpriseExperienceRoutes: EnterpriseExperienceRoute[] = experienceSuites.flatMap((suite) => suite.modules.flatMap((operationModule, moduleIndex) => operationModule.screens.map((title, screenIndex) => ({
  id: suite.phase * 100000 + (moduleIndex + 1) * 100 + screenIndex + 1,
  title,
  path: \`/instances/:instanceId/experience/\${slugify(suite.title)}/\${slugify(operationModule.title)}/\${slugify(title)}\`,
  group: \`\${suite.title} · \${operationModule.title}\`,
  phase: suite.phase,
  kind: kindFor(title),
  area: operationModule.title,
  module: slugify(operationModule.title),
  screenId: \`\${suite.phase}.\${moduleIndex + 1}.\${screenIndex + 1}\`,
  description: \`\${title} with tenant-scoped API data, permission-aware lifecycle actions, nested context, audit evidence, and responsive states.\`,
}))));
`;

writeFileSync(outputPath, generated);
console.log(`Generated ${suites.reduce((total, item) => total + item.modules.reduce((count, entry) => count + entry.screens.length, 0), 0)} experience routes.`);
