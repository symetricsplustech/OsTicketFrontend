import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type NotificationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "notifications", title: "Notifications", screens: [["Notifications Dashboard", "dashboard"], ["Notification Rules", "list"], ["Notification Channels", "settings"], ["Notification History", "list"], ["Notification Record", "record"]] },
  { key: "templates", title: "Templates", screens: [["Email Templates", "list"], ["SMS Templates", "list"], ["Push Templates", "list"], ["Template Variables", "settings"], ["Template Preview", "record"]] },
  { key: "delivery", title: "Delivery", screens: [["Delivery Logs", "list"], ["Delivery Channels", "settings"], ["Delivery Failures", "list"], ["Retry Queue", "list"], ["Delivery Record", "record"]] },
  { key: "subscriptions", title: "Subscriptions", screens: [["My Subscriptions", "list"], ["Subscription Rules", "settings"], ["Unsubscribe", "settings"], ["Digest Settings", "settings"]] },
  { key: "preferences", title: "Preferences", screens: [["Notification Preferences", "settings"], ["Channel Preferences", "settings"], ["Quiet Hours", "settings"], ["Frequency Settings", "settings"]] },
  { key: "communication", title: "Record Communication", screens: [["Communication Log", "list"], ["Communication Threads", "list"], ["Communication Detail", "record"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const notificationRoutes: NotificationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 330000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/notifications/${module.key}/${slug(title)}`,
    group: `Phase 33 · ${module.title}`,
    phase: 33,
    kind,
    area: module.title,
    module: module.key,
    screenId: `33.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const notificationHomePath = notificationRoutes[0].path;
