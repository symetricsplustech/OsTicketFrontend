import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type MobileRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "requester", title: "Requester Mobile", screens: [["Mobile Home", "dashboard"], ["My Tickets", "list"], ["My Requests", "list"], ["Knowledge", "list"], ["Submit Ticket", "record"]] },
  { key: "agent", title: "Mobile Agent", screens: [["Agent Dashboard", "dashboard"], ["My Assignments", "list"], ["Team Queue", "list"], ["SLA Alerts", "list"], ["Quick Actions", "workspace"]] },
  { key: "capabilities", title: "Mobile Capabilities", screens: [["Offline Sync", "settings"], ["Push Notifications", "settings"], ["Biometric Auth", "settings"], ["Barcode Scanner", "settings"], ["Location Services", "settings"]] },
  { key: "configuration", title: "Mobile Configuration", screens: [["App Settings", "settings"], ["Branding", "settings"], ["Feature Flags", "settings"], ["Security Policies", "settings"], ["Deployment", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const mobileRoutes: MobileRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 340000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/mobile/${module.key}/${slug(title)}`,
    group: `Phase 34 · ${module.title}`,
    phase: 34,
    kind,
    area: module.title,
    module: module.key,
    screenId: `34.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const mobileHomePath = mobileRoutes[0].path;
