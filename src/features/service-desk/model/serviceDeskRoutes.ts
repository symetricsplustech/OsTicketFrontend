import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ServiceDeskRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "home", title: "Service Desk Home", screens: [["Service Desk Home", "dashboard"], ["Agent Queue Overview", "dashboard"], ["My Work", "list"], ["My Groups", "list"], ["Unassigned", "list"], ["Recently Updated", "list"], ["Recently Resolved", "list"]] },
  { key: "interactions", title: "Interaction Management", screens: [["Interaction Home", "dashboard"], ["New Interaction", "settings"], ["My Interactions", "list"], ["Unassigned Interactions", "list"], ["Active Interactions", "list"], ["Completed Interactions", "list"], ["Abandoned Interactions", "list"], ["Interaction Record", "record"]] },
  { key: "email", title: "Email Intake", screens: [["Email Intake Queue", "list"], ["Inbound Email Record", "record"], ["Email-to-Task Review", "workspace"], ["Unmatched Email", "list"], ["Email Correlation", "workspace"]] },
  { key: "chat", title: "Chat Intake", screens: [["Chat Queue", "list"], ["Chat Conversation", "record"], ["Chat Transfer", "settings"], ["Chat Transcript", "report"]] },
  { key: "voice", title: "Phone & Voice Intake", screens: [["Phone Intake", "settings"], ["Caller Identification", "workspace"], ["Call Interaction", "record"], ["Call Notes", "record"], ["Voice Transcript", "report"], ["Voice-to-Task Review", "workspace"]] },
  { key: "portal", title: "Portal Intake", screens: [["Portal Submission Queue", "list"], ["Portal Submission Detail", "record"]] },
  { key: "walk-in", title: "Walk-In Intake", screens: [["Walk-In Intake", "settings"], ["Walk-In Queue", "list"]] },
  { key: "conversion", title: "Interaction Conversion", screens: [["Create Incident from Interaction", "settings"], ["Create Request from Interaction", "settings"], ["Create Universal Request from Interaction", "settings"], ["Link Existing Task", "workspace"], ["Transfer Interaction", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const serviceDeskRoutes: ServiceDeskRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map(([title, kind], screenIndex) => ({ id: 10000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/service-desk/${module.key}/${slug(title)}`, group: `Phase 01 · ${module.title}`, phase: 1, kind, area: module.title, module: module.key, screenId: `01.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with omnichannel context, governed interaction lifecycle, assignment, task conversion, and audit history.` })));
export const serviceDeskHomePath = serviceDeskRoutes[0].path;
