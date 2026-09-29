import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type VendorRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Vendors", screens: [["Vendor Home", "dashboard"], ["Vendor Directory", "list"], ["Create Vendor", "settings"], ["Vendor Record", "record"]] },
  { key: "vendor-services", title: "Vendor Services", screens: [["Vendor Services", "list"], ["Vendor Service Record", "record"], ["Service / Offering Links", "list"]] },
  { key: "performance", title: "Performance", screens: [["Vendor Performance", "dashboard"], ["Vendor KPI", "dashboard"], ["SLA Performance", "dashboard"], ["Performance Breakdown", "dashboard"], ["Trend", "dashboard"]] },
  { key: "assessments", title: "Assessments", screens: [["Vendor Assessments", "list"], ["Assessment Record", "record"], ["Assessment Results", "record"]] },
  { key: "vendor-work", title: "Vendor Work", screens: [["Vendor Incidents", "list"], ["Vendor Problems", "list"], ["Vendor Changes", "list"], ["Vendor Actions", "list"]] },
  { key: "improvement", title: "Improvement", screens: [["Vendor Improvement Opportunities", "list"], ["Vendor Improvement Record", "record"], ["Action Plan", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Vendor Metrics", "settings"], ["Assessment Templates", "settings"], ["Vendor Notifications", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const vendorRoutes: VendorRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 270000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/vendor/${module.key}/${slug(title)}`,
    group: `Phase 27 · ${module.title}`,
    phase: 27,
    kind,
    area: module.title,
    module: module.key,
    screenId: `27.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const vendorHomePath = vendorRoutes[0].path;
