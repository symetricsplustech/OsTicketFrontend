import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type LifecycleRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "incident", title: "Incident Lifecycle", screens: [["Incident Lifecycle", "workspace"], ["Incident States", "list"], ["Incident Transitions", "settings"], ["Incident Timeline", "report"]] },
  { key: "problem", title: "Problem Lifecycle", screens: [["Problem Lifecycle", "workspace"], ["Problem States", "list"], ["Problem Transitions", "settings"], ["Problem Timeline", "report"]] },
  { key: "major-incident", title: "Major Incident Lifecycle", screens: [["Major Incident Lifecycle", "workspace"], ["Major Incident States", "list"], ["Major Incident Transitions", "settings"], ["Major Incident Timeline", "report"]] },
  { key: "change", title: "Change Lifecycle", screens: [["Change Lifecycle", "workspace"], ["Change States", "list"], ["Change Transitions", "settings"], ["Change Timeline", "report"]] },
  { key: "request", title: "Request Lifecycle", screens: [["Request Lifecycle", "workspace"], ["Request States", "list"], ["Request Transitions", "settings"], ["Request Timeline", "report"]] },
  { key: "knowledge", title: "Knowledge Lifecycle", screens: [["Knowledge Lifecycle", "workspace"], ["Knowledge States", "list"], ["Knowledge Transitions", "settings"], ["Knowledge Timeline", "report"]] },
  { key: "ci-service", title: "CI/Service Lifecycle", screens: [["CI/Service Lifecycle", "workspace"], ["CI States", "list"], ["Service States", "list"], ["CI/Service Timeline", "report"]] },
  { key: "measurement", title: "Measurement Lifecycle", screens: [["Measurement Lifecycle", "workspace"], ["Measurement States", "list"], ["Measurement Transitions", "settings"], ["Measurement Timeline", "report"]] },
  { key: "acceptance", title: "Acceptance", screens: [["Frontend Acceptance", "dashboard"], ["Acceptance Criteria", "list"], ["UAT Progress", "dashboard"], ["Release Readiness", "report"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const lifecycleRoutes: LifecycleRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 420000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/lifecycles/${module.key}/${slug(title)}`,
    group: `Phase 42 · ${module.title}`,
    phase: 42,
    kind,
    area: module.title,
    module: module.key,
    screenId: `42.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const lifecycleHomePath = lifecycleRoutes[0].path;
