import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type AssignmentRoutingRoute = ScreenDefinition & { group: string };

type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "home", title: "Assignment", screens: [["Assignment Home", "dashboard"], ["My Assignments", "list"], ["My Group Assignments", "list"], ["Unassigned Work", "list"], ["Assignment Rules", "list"], ["Assignment Analytics", "dashboard"]] },
  { key: "routing-rules", title: "Routing Rules", screens: [["Routing Rules", "list"], ["Create Routing Rule", "settings"], ["Routing Rule Record", "record"], ["Routing Conditions", "record"], ["Routing Actions", "record"], ["Routing Test", "settings"]] },
  { key: "queues", title: "Queues", screens: [["Queues", "list"], ["Create Queue", "settings"], ["Queue Record", "record"], ["Queue Members", "list"], ["Queue Work", "list"], ["Queue Analytics", "dashboard"]] },
  { key: "skills", title: "Skills", screens: [["Skills", "list"], ["Create Skill", "settings"], ["Skill Record", "record"], ["Skill Levels", "list"], ["Skill Groups", "list"], ["Skill Assignment", "record"]] },
  { key: "capacity", title: "Capacity", screens: [["Capacity Plans", "list"], ["Create Capacity Plan", "settings"], ["Capacity Plan Record", "record"], ["Capacity Calendar", "dashboard"], ["Capacity Analytics", "dashboard"]] },
  { key: "availability", title: "Availability", screens: [["Availability", "list"], ["Availability Schedule", "record"], ["Availability Calendar", "dashboard"], ["Availability Exceptions", "list"], ["Availability Analytics", "dashboard"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const assignmentRoutingRoutes: AssignmentRoutingRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 110000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/assignment/${module.key}/${slug(title)}`,
    group: `Phase 11 · ${module.title}`,
    phase: 11,
    kind,
    area: module.title,
    module: module.key,
    screenId: `11.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed assignment, routing, queue, skills, capacity, availability, and audit operations.`,
  })),
);

export const assignmentRoutingHomePath = assignmentRoutingRoutes[0].path;