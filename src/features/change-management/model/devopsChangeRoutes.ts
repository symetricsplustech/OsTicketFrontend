import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type DevOpsChangeRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "devops", title: "DevOps Change", screens: [["Change Velocity", "dashboard"], ["Lead Time", "report"], ["Deployment Frequency", "report"], ["Change Failure Rate", "report"], ["MTTR", "report"]] },
  { key: "connections", title: "Connections", screens: [["CI/CD Connections", "list"], ["Cloud Providers", "list"], ["API Integrations", "list"], ["Webhooks", "settings"], ["ServiceNow", "settings"]] },
  { key: "policies", title: "Policies", screens: [["Change Policies", "settings"], ["Quality Gates", "settings"], ["Security Policies", "settings"], ["Compliance Policies", "settings"], ["Approval Policies", "settings"]] },
  { key: "audit", title: "Audit", screens: [["Change Audit", "list"], ["Deployment Audit", "list"], ["Compliance Audit", "list"], ["Audit Reports", "report"], ["Audit Trail", "list"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const devopsChangeRoutes: DevOpsChangeRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 350000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/devops/${module.key}/${slug(title)}`,
    group: `Phase 35 · ${module.title}`,
    phase: 35,
    kind,
    area: module.title,
    module: module.key,
    screenId: `35.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const devopsChangeHomePath = devopsChangeRoutes[0].path;
