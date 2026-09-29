import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type ServiceLevelRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };
const modules: readonly Module[] = [
  { key: "sla-definitions", title: "SLA Definitions", screens: ["SLA Home", "SLA Definitions", "Create SLA", "SLA Record", "Start Conditions", "Pause Conditions", "Stop Conditions", "Reset / Cancel Conditions", "Duration", "Schedule", "Breach Warning", "Escalation"] },
  { key: "ola-definitions", title: "OLA Definitions", screens: ["OLA Definitions", "Create OLA", "OLA Record"] },
  { key: "task-sla", title: "Task SLA", screens: ["Task SLAs", "Active Task SLAs", "Paused Task SLAs", "At-Risk SLAs", "Breached SLAs", "Task SLA Record", "SLA Timeline"] },
  { key: "schedules", title: "Schedules", screens: ["Business Schedules", "Create Schedule", "Schedule Record", "Schedule Entries"] },
  { key: "calendars", title: "Calendars", screens: ["Holiday Calendars", "Create Holiday Calendar", "Holiday Calendar Record", "Holiday Entries"] },
  { key: "escalations", title: "Escalations", screens: ["Escalation Home", "Escalation Rules", "Escalation Rule Record", "Active Escalations", "Escalation Record", "Escalation History"] },
  { key: "reporting", title: "Reporting", screens: ["SLA Compliance", "Breach Analysis", "SLA Trends", "SLA by Service", "SLA by Group", "OLA Reports"] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home$|compliance|analysis|trends|by service|by group|reports$/i.test(title) ? "dashboard" : /create /i.test(title) ? "settings" : /definitions$|task slas$|active task|paused task|at-risk|breached|schedules$|calendars$|entries$|rules$|active escalations/i.test(title) ? "list" : "record";
export const serviceLevelRoutes: ServiceLevelRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: 100000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/service-levels/${module.key}/${slug(title)}`, group: `Phase 10 · ${module.title}`, phase: 10, kind: kindFor(title), area: module.title, module: module.key, screenId: `10.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed SLA/OLA conditions, schedules, timers, breach warnings, escalation, compliance reporting, and audit operations.` })));
export const serviceLevelHomePath = serviceLevelRoutes[0].path;
