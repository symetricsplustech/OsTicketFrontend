import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type OnCallRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "schedules", title: "Schedules", screens: [["On-Call Schedules", "dashboard"], ["Schedule Record", "record"], ["Schedule Shifts", "record"], ["Schedule Calendar", "dashboard"], ["Schedule Audit", "record"]] },
  { key: "rotations", title: "Rotations", screens: [["Rotation Patterns", "list"], ["Create Rotation", "settings"], ["Rotation Record", "record"], ["Rotation Rules", "record"], ["Rotation Calendar", "dashboard"]] },
  { key: "rosters", title: "Rosters", screens: [["On-Call Rosters", "list"], ["Roster Record", "record"], ["Roster Assignments", "record"], ["Roster History", "list"], ["Roster Audit", "record"]] },
  { key: "overrides", title: "Overrides", screens: [["On-Call Overrides", "list"], ["Request Override", "settings"], ["Override Record", "record"], ["Override Approval", "record"], ["Override History", "list"]] },
  { key: "coverage", title: "Coverage", screens: [["Coverage Dashboard", "dashboard"], ["Coverage Gaps", "list"], ["Coverage Analysis", "report"], ["Service Coverage", "record"], ["Coverage Audit", "record"]] },
  { key: "escalation-policies", title: "Escalation Policies", screens: [["Escalation Policies", "list"], ["Create Escalation Policy", "settings"], ["Escalation Policy Record", "record"], ["Escalation Rules", "record"], ["Escalation Matrix", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["On-Call Settings", "settings"], ["Notification Rules", "list"], ["Handoff Rules", "record"], ["On-Call Properties", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const onCallRoutes: OnCallRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 170000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/oncall/${module.key}/${slug(title)}`,
    group: `Phase 17 · ${module.title}`,
    phase: 17,
    kind,
    area: module.title,
    module: module.key,
    screenId: `17.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);

export const onCallHomePath = onCallRoutes[0].path;
