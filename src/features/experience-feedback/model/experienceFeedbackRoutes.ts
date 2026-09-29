import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ExperienceFeedbackRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "surveys", title: "Surveys", screens: [["Survey Home", "dashboard"], ["Survey Definitions", "list"], ["Create Survey", "settings"], ["Survey Builder", "settings"], ["Survey Preview", "workspace"], ["Survey Trigger Rules", "settings"], ["Survey Instances", "list"], ["Survey Response", "record"], ["Survey Results", "record"]] },
  { key: "csat", title: "CSAT", screens: [["CSAT Dashboard", "dashboard"], ["Incident CSAT", "list"], ["Request CSAT", "list"], ["Agent CSAT Detail", "record"]] },
  { key: "assessments", title: "Assessments", screens: [["Assessment Home", "dashboard"], ["Assessment Definitions", "list"], ["Assessment Builder", "settings"], ["Metric Categories", "list"], ["Metrics", "list"], ["Assessment Instances", "list"], ["Assessment Response", "record"], ["Assessment Results", "record"]] },
  { key: "feedback", title: "Feedback", screens: [["Feedback Home", "dashboard"], ["Requester Feedback", "list"], ["Knowledge Feedback", "list"], ["Walk-Up Feedback", "list"], ["Vendor Feedback", "list"]] },
  { key: "configuration", title: "Configuration", screens: [["Survey Scales", "settings"], ["Anonymous Rules", "settings"], ["Trigger Configuration", "settings"], ["Reminder Rules", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const experienceFeedbackRoutes: ExperienceFeedbackRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 280000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/experience-feedback/${module.key}/${slug(title)}`,
    group: `Phase 28 · ${module.title}`,
    phase: 28,
    kind,
    area: module.title,
    module: module.key,
    screenId: `28.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const experienceFeedbackHomePath = experienceFeedbackRoutes[0].path;
