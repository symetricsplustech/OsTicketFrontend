import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ImprovementRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "opportunities", title: "Opportunities", screens: [["Improvement Home", "dashboard"], ["Opportunities", "list"], ["Create Opportunity", "settings"], ["Opportunity Record", "record"]] },
  { key: "assessments", title: "Assessments", screens: [["Improvement Assessments", "list"], ["Assessment Record", "record"], ["Prioritization", "workspace"]] },
  { key: "initiatives", title: "Initiatives", screens: [["Approved Initiatives", "list"], ["In-Progress Improvements", "list"], ["Improvement Record", "record"]] },
  { key: "tasks", title: "Tasks", screens: [["Improvement Tasks", "list"], ["Create Improvement Task", "settings"], ["Improvement Task Record", "record"]] },
  { key: "measurement", title: "Measurement", screens: [["Baseline", "record"], ["Target", "record"], ["KPIs", "dashboard"], ["Measurement Plan", "record"], ["Measurement Results", "report"]] },
  { key: "benefits", title: "Benefits", screens: [["Benefits Review", "list"], ["Benefit Record", "record"], ["Evidence", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Prioritization Rules", "list"], ["Assessment Criteria", "list"], ["Improvement States", "list"], ["Improvement Properties", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const improvementRoutes: ImprovementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 210000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/improvement/${module.key}/${slug(title)}`,
    group: `Phase 21 · ${module.title}`,
    phase: 21,
    kind,
    area: module.title,
    module: module.key,
    screenId: `21.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed improvement lifecycle, prioritization, measurement, benefits, and audit operations.`,
  })),
);
export const improvementHomePath = improvementRoutes[0].path;
