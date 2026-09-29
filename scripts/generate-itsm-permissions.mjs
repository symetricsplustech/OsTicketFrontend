import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(
  here,
  "../../SERVICENOW_ITSM_GRANULAR_PERMISSIONS_FINAL.md",
);
const target = path.resolve(here, "../src/shared/itsmPermissions.generated.ts");
const markdown = fs.readFileSync(source, "utf8");

const modules = new Map();
let currentModule = null;
let currentLabel = null;

for (const line of markdown.split(/\r?\n/)) {
  const heading = line.match(/^# MODULE (\d{2}) (?:—|---) (.+)$/);
  if (heading) {
    const number = Number(heading[1]);
    currentModule = number >= 1 && number <= 18 ? number : null;
    currentLabel = heading[2].trim();
    continue;
  }
  if (!currentModule) continue;
  const match = line.match(/^- {1,3}\[[ xX]\] `(itsm\.[a-z0-9_.]+)`/);
  if (!match) continue;
  // A module may declare more than one namespace (e.g. MODULE 08 also
  // declares `universal_request`), so group by namespace, not by module.
  const namespace = `${match[1].split(".").slice(0, 2).join(".")}`;
  if (!modules.has(namespace)) {
    modules.set(namespace, {
      number: currentModule,
      key: namespace.replace("itsm.", ""),
      label: currentLabel,
      namespace: `${namespace}.*`,
      permissions: new Set(),
    });
  }
  modules.get(namespace).permissions.add(match[1]);
}

const output = `// Generated from SERVICENOW_ITSM_GRANULAR_PERMISSIONS_FINAL.md.\n// Run: npm run permissions:generate\nexport interface ItsmPermissionModule {\n  number: number;\n  key: string;\n  label: string;\n  namespace: string;\n  permissions: readonly string[];\n}\n\nexport const ITSM_PERMISSION_MODULES = ${JSON.stringify(
  [...modules.values()].map((module) => ({
    ...module,
    permissions: [...module.permissions].sort(),
  })),
  null,
  2,
)} as const satisfies readonly ItsmPermissionModule[];\n\nexport const ITSM_PERMISSION_KEYS = ITSM_PERMISSION_MODULES.flatMap((module) => [...module.permissions]);\n`;

fs.writeFileSync(target, output);
const total = [...modules.values()].reduce(
  (sum, module) => sum + module.permissions.size,
  0,
);
console.log(
  `Generated ${total} permissions across ${modules.size} namespaces.`,
);
