import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ConversationalServiceRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "virtual-agent", title: "Virtual Agent", screens: [["VA Launcher", "dashboard"], ["Conversation", "workspace"], ["Topic Menu", "list"], ["Free-Text Question", "record"], ["Attachment", "record"], ["Conversation History", "list"]] },
  { key: "itsm-topics", title: "ITSM Topics", screens: [["Knowledge Answer", "record"], ["Create Incident", "settings"], ["Create Request", "settings"], ["Check Incident", "record"], ["Check Request", "record"], ["Common Troubleshooting", "list"], ["Catalog Fulfillment", "settings"]] },
  { key: "live-agent", title: "Live Agent", screens: [["Live Agent Handoff", "settings"], ["Queue Wait", "record"], ["Transfer Summary", "record"], ["Agent Chat", "workspace"], ["End Conversation", "settings"]] },
  { key: "voice-agent", title: "Voice Agent", screens: [["Voice Entry", "settings"], ["Caller Verification", "record"], ["Voice Conversation", "workspace"], ["Voice Summary", "record"], ["Voice Handoff", "settings"]] },
  { key: "configuration", title: "Configuration", screens: [["VA Topics", "list"], ["Topic Builder", "settings"], ["Conversation Flows", "list"], ["Fallback", "settings"], ["Handoff Rules", "list"], ["Channel Configuration", "settings"], ["VA Analytics", "report"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const conversationalServiceRoutes: ConversationalServiceRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 240000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/conversational/${module.key}/${slug(title)}`,
    group: `Phase 24 · ${module.title}`,
    phase: 24,
    kind,
    area: module.title,
    module: module.key,
    screenId: `24.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed conversational self-service, ITSM topics, live agent, voice agent, and audit operations.`,
  })),
);
export const conversationalServiceHomePath = conversationalServiceRoutes[0].path;
