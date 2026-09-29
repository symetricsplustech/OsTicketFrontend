import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type OutageRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "outages", title: "Outages", screens: [["Outage Home", "dashboard"], ["Active Outages", "list"], ["Planned Outages", "list"], ["Resolved Outages", "list"], ["Closed Outages", "list"], ["Create Outage", "settings"], ["Outage Record", "record"]] },
  { key: "outage-impact", title: "Outage Impact", screens: [["Affected Service", "record"], ["Affected CI", "record"], ["Affected Users / Locations", "list"], ["Impact Timeline", "record"]] },
  { key: "outage-relationships", title: "Outage Relationships", screens: [["Related Incidents", "list"], ["Major Incident", "record"], ["Related Change", "record"]] },
  { key: "outage-communications", title: "Outage Communications", screens: [["Outage Communication", "workspace"], ["Stakeholder Update", "record"], ["Communication History", "record"]] },
  { key: "service-status", title: "Service Status", screens: [["Service Status Home", "dashboard"], ["Current Status", "dashboard"], ["Planned Maintenance", "list"], ["Service Status Detail", "record"], ["Requester Status Page", "record"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const outageRoutes: OutageRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 160000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/outages/${module.key}/${slug(title)}`,
    group: `Phase 16 · ${module.title}`,
    phase: 16,
    kind,
    area: module.title,
    module: module.key,
    screenId: `16.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const outageHomePath = outageRoutes[0].path;
