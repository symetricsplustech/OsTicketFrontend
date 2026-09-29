import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type WorkforceRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Workforce Home", screens: [["WFO Home", "dashboard"], ["Demand vs Capacity", "dashboard"], ["Coverage", "dashboard"], ["Backlog", "list"], ["Team Performance", "dashboard"]] },
  { key: "scheduling", title: "Scheduling", screens: [["Team Schedules", "list"], ["Schedule Planner", "workspace"], ["Shifts", "list"], ["Create Shift", "settings"], ["Shift Record", "record"], ["Availability", "list"], ["Time Off", "list"], ["Time-Off Request", "record"], ["Shift Swap", "workspace"]] },
  { key: "skills", title: "Skills", screens: [["Skills Directory", "list"], ["Agent Skills", "list"], ["Skill Profiles", "record"], ["Skill Gaps", "list"], ["Skill Assignment", "workspace"]] },
  { key: "performance", title: "Performance", screens: [["Agent Performance", "dashboard"], ["Team Performance", "dashboard"], ["Performance Trends", "dashboard"], ["KPI Detail", "record"]] },
  { key: "coaching", title: "Coaching", screens: [["Coaching Opportunities", "list"], ["Coaching Queue", "list"], ["Coaching Record", "record"], ["Coaching Plan", "record"], ["Coaching History", "list"]] },
  { key: "learning", title: "Learning", screens: [["Learning Recommendations", "list"], ["Learning Assignment", "record"], ["Learning Progress", "dashboard"]] },
  { key: "configuration", title: "Configuration", screens: [["Capacity Rules", "settings"], ["Scheduling Rules", "settings"], ["Skills Configuration", "settings"], ["Performance Metrics", "settings"], ["Coaching Configuration", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const workforceRoutes: WorkforceRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 260000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/workforce/${module.key}/${slug(title)}`,
    group: `Phase 26 · ${module.title}`,
    phase: 26,
    kind,
    area: module.title,
    module: module.key,
    screenId: `26.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const workforceHomePath = workforceRoutes[0].path;
