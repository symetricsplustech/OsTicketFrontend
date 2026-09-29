import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type AdminCenterRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Admin Center", screens: [["Admin Home", "dashboard"]] },
  { key: "guided-setup", title: "Guided Setup", screens: [["Guided Setup", "workspace"], ["Setup Wizard", "settings"], ["Setup Checklist", "list"], ["Setup Progress", "dashboard"]] },
  { key: "process", title: "Process Administration", screens: [["Process Administration", "workspace"], ["Workflow Designer", "workspace"], ["Process Records", "list"], ["Process Audit", "report"]] },
  { key: "data", title: "Data Administration", screens: [["Data Administration", "workspace"], ["Data Imports", "list"], ["Data Exports", "list"], ["Data Retention", "settings"]] },
  { key: "operations", title: "Operations Administration", screens: [["Operations Administration", "workspace"], ["Schedules", "list"], ["Queues", "list"], ["Operational Audit", "report"]] },
  { key: "experience", title: "Experience Administration", screens: [["Experience Administration", "workspace"], ["Portal Configuration", "settings"], ["Branding", "settings"], ["Experience Audit", "report"]] },
  { key: "analytics", title: "Analytics Administration", screens: [["Analytics Administration", "workspace"], ["Dashboards", "list"], ["Reports", "list"], ["Analytics Audit", "report"]] },
  { key: "integration", title: "Integration Administration", screens: [["Integration Administration", "workspace"], ["Connected Apps", "list"], ["API Management", "settings"], ["Integration Audit", "report"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const adminCenterRoutes: AdminCenterRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 400000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/admin-center/${module.key}/${slug(title)}`,
    group: `Phase 40 · ${module.title}`,
    phase: 40,
    kind,
    area: module.title,
    module: module.key,
    screenId: `40.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const adminCenterHomePath = adminCenterRoutes[0].path;
