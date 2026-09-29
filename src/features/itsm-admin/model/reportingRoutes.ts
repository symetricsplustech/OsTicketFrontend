import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ReportingRoute = ScreenDefinition & { group: string };

type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "reports", title: "Reports", screens: [["Report Catalog", "list"], ["Report Builder", "settings"], ["Report Record", "record"], ["Report History", "list"]] },
  { key: "dashboards", title: "Dashboards", screens: [["Dashboard Catalog", "list"], ["Dashboard Builder", "settings"], ["Widget Configuration", "settings"], ["Dashboard Sharing", "settings"]] },
  { key: "scheduling", title: "Scheduling", screens: [["Scheduled Reports", "list"], ["Create Schedule", "settings"], ["Schedule Record", "record"], ["Delivery Log", "list"]] },
  { key: "exports", title: "Exports", screens: [["Export Jobs", "list"], ["Create Export", "settings"], ["Export Record", "record"], ["Export History", "list"]] },
  { key: "operational-dashboards", title: "Operational Dashboards", screens: [["Operational Home", "dashboard"], ["Incident Dashboard", "dashboard"], ["Change Dashboard", "dashboard"], ["Service Dashboard", "dashboard"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const reportingRoutes: ReportingRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 320000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/reporting/${module.key}/${slug(title)}`,
    group: `Phase 32 · ${module.title}`,
    phase: 32,
    kind,
    area: module.title,
    module: module.key,
    screenId: `32.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed reporting, scheduling, and audit operations.`,
  })),
);

export const reportingHomePath = reportingRoutes[0].path;
