import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type AutomationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "flows", title: "Flows", screens: [["Flow Designer", "workspace"], ["Active Flows", "list"], ["Flow Templates", "list"], ["Flow Executions", "list"], ["Flow Analytics", "report"]] },
  { key: "playbooks", title: "Playbooks", screens: [["Playbook Designer", "workspace"], ["Active Playbooks", "list"], ["Playbook Templates", "list"], ["Playbook Executions", "list"], ["Playbook Library", "list"]] },
  { key: "automation", title: "Automation", screens: [["Automation Rules", "settings"], ["Automation Actions", "settings"], ["Automation Triggers", "settings"], ["Automation Schedules", "settings"], ["Automation Logs", "list"]] },
  { key: "task-automation", title: "Task Automation", screens: [["Task Rules", "settings"], ["Task Templates", "list"], ["Task Executions", "list"], ["Task Analytics", "report"], ["Task Schedules", "settings"]] },
  { key: "configuration", title: "Configuration", screens: [["Integration Config", "settings"], ["API Keys", "settings"], ["Webhook Config", "settings"], ["System Settings", "settings"], ["Automation Settings", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const automationRoutes: AutomationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 360000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/automation/${module.key}/${slug(title)}`,
    group: `Phase 36 · ${module.title}`,
    phase: 36,
    kind,
    area: module.title,
    module: module.key,
    screenId: `36.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const automationHomePath = automationRoutes[0].path;
