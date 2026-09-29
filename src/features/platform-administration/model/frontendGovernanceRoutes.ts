import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type FrontendGovernanceRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "list-personalization", title: "List Personalization", screens: [["List Personalization", "settings"], ["Column Layouts", "list"], ["Saved Views", "list"], ["Filter Presets", "list"]] },
  { key: "form-personalization", title: "Form Personalization", screens: [["Form Personalization", "settings"], ["Field Layouts", "list"], ["Section Config", "settings"], ["Validation Rules", "settings"]] },
  { key: "tags-watchers", title: "Tags & Watchers", screens: [["Tags & Watchers", "settings"], ["Tag Management", "list"], ["Watcher Rules", "settings"], ["Notification Rules", "settings"]] },
  { key: "templates", title: "Templates", screens: [["Templates", "list"], ["Template Designer", "workspace"], ["Template Library", "list"], ["Template Variables", "settings"]] },
  { key: "accessibility", title: "Accessibility", screens: [["Accessibility", "dashboard"], ["Accessibility Audit", "report"], ["WCAG Compliance", "report"], ["Keyboard Navigation", "settings"]] },
  { key: "ui-states", title: "UI States", screens: [["UI States", "settings"], ["Empty States", "settings"], ["Loading States", "settings"], ["Error States", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const frontendGovernanceRoutes: FrontendGovernanceRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 410000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/frontend-governance/${module.key}/${slug(title)}`,
    group: `Phase 41 · ${module.title}`,
    phase: 41,
    kind,
    area: module.title,
    module: module.key,
    screenId: `41.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const frontendGovernanceHomePath = frontendGovernanceRoutes[0].path;
