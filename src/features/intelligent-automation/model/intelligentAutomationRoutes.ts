import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type IntelligentAutomationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "ai-search", title: "AI Search", screens: [["AI Search Home", "dashboard"], ["Search Results", "list"], ["Suggestions", "list"], ["Facets", "list"], ["Result Preview", "record"], ["Search Feedback", "record"], ["No-Result Recovery", "workspace"], ["Search Analytics", "dashboard"]] },
  { key: "predictive", title: "Predictive Intelligence", screens: [["Prediction Home", "dashboard"], ["Classification Suggestions", "list"], ["Categorization Suggestions", "list"], ["Priority Suggestions", "list"], ["Assignment Suggestions", "list"], ["Similarity Results", "list"], ["Prediction Feedback", "record"]] },
  { key: "task-intelligence", title: "Task Intelligence", screens: [["Task Intelligence Home", "dashboard"], ["Field Predictions", "list"], ["Language Detection", "list"], ["Sentiment / Signals", "list"], ["Routing Suggestions", "list"]] },
  { key: "now-assist", title: "Now Assist", screens: [["Record Summary", "record"], ["Conversation Summary", "record"], ["Resolution Generation", "workspace"], ["Response Draft", "record"], ["Knowledge Generation", "workspace"], ["Suggested Steps", "list"], ["Knowledge Recommendations", "list"]] },
  { key: "ai-agent", title: "AI Agent / Specialist UI", screens: [["AI Work Queue", "list"], ["AI Task Record", "record"], ["AI Action Plan", "record"], ["AI Action History", "list"], ["Human Approval", "workspace"], ["Escalate to Human", "workspace"], ["AI Outcome Review", "record"]] },
  { key: "ai-governance", title: "AI Governance", screens: [["AI Suggestion History", "list"], ["Confidence", "dashboard"], ["Accept / Edit / Reject", "settings"], ["AI Feedback", "record"], ["AI Audit", "list"], ["Fallback / Failure State", "workspace"]] },
  { key: "configuration", title: "Configuration", screens: [["AI Feature Configuration", "settings"], ["Prediction Models", "settings"], ["Thresholds", "settings"], ["Human Approval Rules", "settings"], ["AI Permissions", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const intelligentAutomationRoutes: IntelligentAutomationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 250000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/intelligent-automation/${module.key}/${slug(title)}`,
    group: `Phase 25 · ${module.title}`,
    phase: 25,
    kind,
    area: module.title,
    module: module.key,
    screenId: `25.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const intelligentAutomationHomePath = intelligentAutomationRoutes[0].path;
