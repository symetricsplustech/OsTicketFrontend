import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ProblemRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };

const modules: readonly Module[] = [
  { key: "home", title: "Problem Home", screens: ["Problem Home", "Problem Dashboard"] },
  { key: "queues", title: "Problem Queues", screens: ["My Problems", "My Group Problems", "Open Problems", "Problems Under Investigation", "Resolved Problems", "Closed Problems", "All Problems"] },
  { key: "workspace", title: "Problem Workspace", screens: ["Create Problem", "Problem Overview", "Problem Details", "Problem Activity", "Problem Related Records", "Problem CIs & Services", "Problem Attachments", "Problem Audit"] },
  { key: "rca", title: "Root Cause Analysis", screens: ["RCA Workspace", "RCA Evidence", "RCA Method", "Root Cause Record", "Cause Notes"] },
  { key: "workarounds", title: "Workarounds", screens: ["Workaround Editor", "Publish Workaround", "Workaround History"] },
  { key: "known-errors", title: "Known Error", screens: ["Known Errors", "Create Known Error", "Known Error Record", "Known Error Knowledge Link"] },
  { key: "problem-tasks", title: "Problem Tasks", screens: ["Problem Tasks", "Create Problem Task", "Problem Task Record"] },
  { key: "fix-management", title: "Fix Management", screens: ["Fix Tasks", "Create Fix Task", "Fix Task Record", "Fix Change Link"] },
  { key: "configuration", title: "Configuration", screens: ["Problem Models", "Problem States", "RCA Methods", "Problem Categories", "Problem Notifications", "Problem Properties"] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard|overview/i.test(title) ? "dashboard" : /create|editor|publish/i.test(title) ? "settings" : /my |open |resolved|closed|all |known errors$|tasks$|models$|states$|methods$|categories$|notifications$|properties$/i.test(title) ? "list" : /workspace/i.test(title) ? "workspace" : "record";

export const problemRoutes: ProblemRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map((title, screenIndex) => ({
    id: 40000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/problems/${module.key}/${slug(title)}`,
    group: `Phase 04 · ${module.title}`,
    phase: 4,
    kind: kindFor(title),
    area: module.title,
    module: module.key,
    screenId: `04.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed problem lifecycle, root-cause evidence, workaround, known-error, fix, and audit operations.`,
  })),
);

export const problemHomePath = problemRoutes[0].path;
