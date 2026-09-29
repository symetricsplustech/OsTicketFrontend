import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ServiceOperationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Workspace Home", screens: [["SOW Home", "dashboard"], ["My Work", "list"], ["My Groups", "list"], ["Unassigned", "list"], ["SLA Risk", "list"], ["High Priority", "list"], ["Major Incidents", "list"], ["Outages", "list"], ["Recent Work", "list"]] },
  { key: "multi-record", title: "Multi-Record Experience", screens: [["Tabbed Records", "workspace"], ["Recent Tabs", "list"], ["Record Navigation", "workspace"], ["Unsaved Tab State", "workspace"]] },
  { key: "side-panel", title: "Contextual Side Panel", screens: [["Record Information", "record"], ["Related Records", "list"], ["Agent Assist", "workspace"], ["Knowledge Search", "list"], ["Similar Records", "list"], ["On-Call", "list"], ["Collaboration", "workspace"]] },
  { key: "lists", title: "Lists", screens: [["Workspace Lists", "list"], ["List Configuration", "settings"], ["Saved Workspace Views", "list"]] },
  { key: "inbox", title: "Inbox", screens: [["Inbox", "list"], ["Assigned Work Items", "list"], ["Accept Work", "settings"], ["Reject / Requeue Work", "settings"], ["Inbox History", "list"]] },
  { key: "interactions", title: "Interactions", screens: [["Workspace Interactions", "list"], ["Interaction Record", "record"], ["Convert Interaction", "settings"]] },
  { key: "configuration", title: "Configuration", screens: [["Workspace Landing Configuration", "settings"], ["Record Page Configuration", "settings"], ["Workspace Actions", "settings"], ["Workspace Preferences", "settings"], ["Workspace List Configuration", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const serviceOperationsRoutes: ServiceOperationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 220000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/service-operations/${module.key}/${slug(title)}`,
    group: `Phase 22 · ${module.title}`,
    phase: 22,
    kind,
    area: module.title,
    module: module.key,
    screenId: `22.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed service operations workspace, multi-record, contextual panel, lists, inbox, interactions, and audit operations.`,
  })),
);
export const serviceOperationsHomePath = serviceOperationsRoutes[0].path;
