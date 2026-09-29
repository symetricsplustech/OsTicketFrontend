import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ChangeRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };

const modules: readonly Module[] = [
  { key: "home", title: "Change Home", screens: ["Change Home", "Change Dashboard"] },
  { key: "queues", title: "Change Queues", screens: ["My Changes", "My Group Changes", "Open Changes", "Awaiting Approval", "Scheduled Changes", "In-Progress Changes", "Review Changes", "Closed Changes", "Failed Changes", "Backed-Out Changes", "All Changes"] },
  { key: "creation", title: "Change Creation", screens: ["New Change", "Select Change Model", "Normal Change", "Standard Change", "Emergency Change"] },
  { key: "workspace", title: "Change Workspace", screens: ["Change Overview", "Change Details", "Planning", "Risk", "Schedule", "Conflicts", "Approvals", "CAB", "Change Tasks", "Affected CIs", "Affected Services", "Implementation", "Validation", "PIR", "Related Records", "Activity", "Attachments", "Audit"] },
  { key: "risk-assessment", title: "Risk Assessment", screens: ["Risk Questionnaire", "Risk Calculation", "Risk Factors", "Risk Override", "Risk History"] },
  { key: "conflict-detection", title: "Conflict Detection", screens: ["Conflict Results", "CI Conflicts", "Service Conflicts", "Schedule Conflicts", "Conflict Resolution"] },
  { key: "calendar", title: "Change Calendar", screens: ["Change Calendar", "Day View", "Week View", "Month View", "Maintenance Window Overlay", "Blackout Overlay", "Conflict Overlay"] },
  { key: "cab", title: "CAB", screens: ["CAB Home", "CAB Meetings", "Create CAB Meeting", "CAB Agenda", "CAB Meeting Workspace", "CAB Change Review", "CAB Decision", "CAB Minutes", "CAB Actions"] },
  { key: "tasks", title: "Change Tasks", screens: ["Change Tasks", "Create Change Task", "Change Task Record"] },
  { key: "standard-catalog", title: "Standard Change Catalog", screens: ["Standard Change Catalog", "Standard Change Template", "Propose Standard Change", "Standard Change Approval"] },
  { key: "models", title: "Change Models", screens: ["Change Models", "Create Change Model", "Change Model Record", "Model State Flow", "Model Conditions"] },
  { key: "windows", title: "Windows", screens: ["Maintenance Windows", "Maintenance Window Record", "Blackout Windows", "Blackout Window Record"] },
  { key: "configuration", title: "Configuration", screens: ["Change States", "Change Approval Policies", "Risk Rules", "Conflict Rules", "Change Notifications", "Change Properties"] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard|overview/i.test(title) ? "dashboard" : /calendar|day view|week view|month view|overlay/i.test(title) ? "dashboard" : /new |create |select change model|normal change|standard change$|emergency change|questionnaire|override|propose/i.test(title) ? "settings" : /my |open |awaiting|scheduled changes|in-progress|review changes|closed changes|failed changes|backed-out|all changes|meetings$|tasks$|catalog$|models$|windows$|states$|policies$|rules$|notifications$|properties$/i.test(title) ? "list" : /workspace/i.test(title) ? "workspace" : "record";

export const changeRoutes: ChangeRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map((title, screenIndex) => ({
    id: 50000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/changes/${module.key}/${slug(title)}`,
    group: `Phase 05 · ${module.title}`,
    phase: 5,
    kind: kindFor(title),
    area: module.title,
    module: module.key,
    screenId: `05.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed change planning, risk, schedule, approval, CAB, implementation, validation, and audit operations.`,
  })),
);

export const changeHomePath = changeRoutes[0].path;
