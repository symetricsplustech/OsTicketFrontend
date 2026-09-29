import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type CsdmRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "foundation", title: "CSDM Foundation", screens: [["CSDM Home", "dashboard"], ["CSDM Domain View", "dashboard"], ["CSDM Relationship View", "dashboard"], ["CSDM Validation", "record"]] },
  { key: "business-services", title: "Business Services", screens: [["Business Services", "list"], ["Create Business Service", "settings"], ["Business Service Record", "record"]] },
  { key: "technical-services", title: "Technical Services", screens: [["Technical Services", "list"], ["Create Technical Service", "settings"], ["Technical Service Record", "record"]] },
  { key: "service-offerings", title: "Service Offerings", screens: [["Service Offerings", "list"], ["Create Service Offering", "settings"], ["Service Offering Record", "record"]] },
  { key: "application-services", title: "Application Services", screens: [["Application Services", "list"], ["Application Service Record", "record"]] },
  { key: "relationships", title: "Service Relationships", screens: [["Supporting CIs", "list"], ["Dependent Services", "list"], ["Service Relationship Editor", "settings"]] },
  { key: "ownership", title: "Ownership", screens: [["Service Owners", "list"], ["Service Support Groups", "list"], ["Service Stakeholders", "list"]] },
  { key: "health", title: "Service Health", screens: [["Service Status", "dashboard"], ["Service KPI", "dashboard"], ["Service Incidents", "list"], ["Service Problems", "list"], ["Service Changes", "list"], ["Service Outages", "list"], ["Service SLA", "dashboard"]] },
  { key: "owner-workspace", title: "Service Owner Workspace", screens: [["Service Owner Home", "dashboard"], ["My Services", "list"], ["Service Workspace", "workspace"], ["Service Performance", "dashboard"], ["Service Risks", "list"], ["Service Improvements", "list"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const csdmRoutes: CsdmRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 140000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/services/${module.key}/${slug(title)}`,
    group: `Phase 14 · ${module.title}`,
    phase: 14,
    kind,
    area: module.title,
    module: module.key,
    screenId: `14.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const csdmHomePath = csdmRoutes[0].path;
