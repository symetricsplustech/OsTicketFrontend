import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type PerformanceAnalyticsRoute = ScreenDefinition & { group: string };

type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "home", title: "Analytics Home", screens: [["ITSM Analytics Home", "dashboard"], ["Scorecards", "dashboard"], ["KPI Summary", "dashboard"], ["Trends", "dashboard"]] },
  { key: "indicators", title: "Indicators", screens: [["Indicators", "list"], ["Create Indicator", "settings"], ["Indicator Record", "record"], ["Indicator Sources", "list"], ["Collection Status", "list"]] },
  { key: "breakdowns", title: "Breakdowns", screens: [["Breakdowns", "list"], ["Create Breakdown", "settings"], ["Breakdown Record", "record"], ["Breakdown Sources", "list"]] },
  { key: "targets", title: "Targets", screens: [["Targets", "list"], ["Create Target", "settings"], ["Target Record", "record"]] },
  { key: "process-analytics", title: "Process Analytics", screens: [["Incident Analytics", "dashboard"], ["Problem Analytics", "dashboard"], ["Change Analytics", "dashboard"], ["Request Analytics", "dashboard"], ["Knowledge Analytics", "dashboard"], ["SLA Analytics", "dashboard"], ["Service Analytics", "dashboard"], ["Asset Analytics", "dashboard"]] },
  { key: "dashboards", title: "Dashboards", screens: [["Analytics Dashboards", "dashboard"], ["Dashboard Builder", "settings"], ["Widget Configuration", "settings"], ["Dashboard Sharing", "settings"]] },
  { key: "configuration", title: "Configuration", screens: [["Data Collection", "settings"], ["Scheduled Collection", "settings"], ["Analytics Permissions", "settings"], ["Analytics Properties", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const performanceAnalyticsRoutes: PerformanceAnalyticsRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 300000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/performance-analytics/${module.key}/${slug(title)}`,
    group: `Phase 30 · ${module.title}`,
    phase: 30,
    kind,
    area: module.title,
    module: module.key,
    screenId: `30.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed analytics, targets, and audit operations.`,
  })),
);

export const performanceAnalyticsHomePath = performanceAnalyticsRoutes[0].path;
