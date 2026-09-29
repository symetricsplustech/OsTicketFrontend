import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type WalkUpRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "queue", title: "Queue", screens: [["Service Queue", "dashboard"], ["Queue Record", "record"], ["Queue Status", "record"], ["Abandoned Tickets", "list"], ["Queue Audit", "record"]] },
  { key: "appointments", title: "Appointments", screens: [["Appointments", "list"], ["Book Appointment", "settings"], ["Appointment Record", "record"], ["Appointment Calendar", "dashboard"], ["Appointment Reminders", "list"]] },
  { key: "locations", title: "Locations", screens: [["Walk-Up Locations", "list"], ["Location Record", "record"], ["Location Hours", "record"], ["Location Services", "record"], ["Location Audit", "record"]] },
  { key: "kiosks", title: "Kiosks", screens: [["Self-Service Kiosks", "list"], ["Kiosk Record", "record"], ["Kiosk Status", "record"], ["Kiosk Sessions", "list"], ["Kiosk Configuration", "settings"]] },
  { key: "stock", title: "Stock", screens: [["Stock Inventory", "list"], ["Stock Record", "record"], ["Stock Alerts", "list"], ["Restock Requests", "list"], ["Stock Audit", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Walk-Up Settings", "settings"], ["Ticket Rules", "list"], ["Routing Rules", "record"], ["Walk-Up Properties", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const walkUpRoutes: WalkUpRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 180000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/walk-up/${module.key}/${slug(title)}`,
    group: `Phase 18 · ${module.title}`,
    phase: 18,
    kind,
    area: module.title,
    module: module.key,
    screenId: `18.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);

export const walkUpHomePath = walkUpRoutes[0].path;
