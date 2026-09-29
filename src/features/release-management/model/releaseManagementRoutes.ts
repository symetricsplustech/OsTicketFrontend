import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ReleaseManagementRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Release Management", screens: [["Release Dashboard", "dashboard"], ["Release Summary", "record"], ["Upcoming Releases", "list"], ["Release Calendar", "dashboard"], ["Release Audit", "record"]] },
  { key: "release-planning", title: "Release Planning", screens: [["Release Plans", "list"], ["Create Release Plan", "settings"], ["Release Plan Record", "record"], ["Planning Board", "dashboard"], ["Plan Milestones", "record"]] },
  { key: "release-tasks", title: "Release Tasks", screens: [["Release Tasks", "list"], ["Create Release Task", "settings"], ["Release Task Record", "record"], ["Task Dependencies", "record"], ["Task Checklist", "record"]] },
  { key: "execution", title: "Execution", screens: [["Release Execution", "dashboard"], ["Execution Runbook", "record"], ["Execution Steps", "record"], ["Go/No-Go", "record"], ["Execution Audit", "record"]] },
  { key: "digital-product-release", title: "Digital Product Release", screens: [["Digital Product Releases", "list"], ["Create Digital Release", "settings"], ["Digital Release Record", "record"], ["Version History", "list"], ["Deployment Record", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Release Settings", "settings"], ["Release Policies", "list"], ["Gates and Approvals", "record"], ["Release Properties", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const releaseManagementRoutes: ReleaseManagementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 200000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/releases/${module.key}/${slug(title)}`,
    group: `Phase 20 · ${module.title}`,
    phase: 20,
    kind,
    area: module.title,
    module: module.key,
    screenId: `20.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);

export const releaseManagementHomePath = releaseManagementRoutes[0].path;
