import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '../../SERVICENOW_ITSM_GRANULAR_PERMISSIONS_FROM_TECHNICAL_MASTER.md');
const target = path.resolve(here, '../src/shared/itsmPermissions.generated.ts');
const markdown = fs.readFileSync(source, 'utf8');

const moduleNames = new Map();
const permissions = new Map();
let currentModule = null;

for (const line of markdown.split(/\r?\n/)) {
  const heading = line.match(/^# MODULE (\d{2}) — (.+)$/);
  if (heading) {
    const number = Number(heading[1]);
    currentModule = number >= 1 && number <= 10 ? number : null;
    if (currentModule) {
      moduleNames.set(currentModule, heading[2].trim());
      permissions.set(currentModule, []);
    }
    continue;
  }
  if (!currentModule) continue;
  const match = line.match(/^- \[[ xX]\] `(itsm\.[a-z0-9_.]+)`/);
  if (match) permissions.get(currentModule).push(match[1]);
}

const modules = [...permissions.entries()].map(([number, keys]) => {
  const unique = [...new Set(keys)].sort();
  const namespace = unique[0]?.split('.').slice(0, 2).join('.') || '';
  return { number, key: namespace.replace('itsm.', ''), label: moduleNames.get(number), namespace: `${namespace}.*`, permissions: unique };
});

const output = `// Generated from SERVICENOW_ITSM_GRANULAR_PERMISSIONS_FROM_TECHNICAL_MASTER.md.\n// Run: npm run permissions:generate\nexport interface ItsmPermissionModule {\n  number: number;\n  key: string;\n  label: string;\n  namespace: string;\n  permissions: readonly string[];\n}\n\nexport const ITSM_PERMISSION_MODULES = ${JSON.stringify(modules, null, 2)} as const satisfies readonly ItsmPermissionModule[];\n\nexport const ITSM_PERMISSION_KEYS = ITSM_PERMISSION_MODULES.flatMap((module) => [...module.permissions]);\n`;

fs.writeFileSync(target, output);
console.log(`Generated ${modules.reduce((sum, module) => sum + module.permissions.length, 0)} permissions across ${modules.length} modules.`);
