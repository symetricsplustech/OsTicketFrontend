import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type AssetManagementRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "assets", title: "Assets", screens: [["Asset Home", "dashboard"], ["All Assets", "list"], ["My Assets", "list"], ["Unassigned Assets", "list"], ["Assets by User", "list"], ["Assets by Location", "list"], ["Create Asset", "settings"], ["Asset Record", "record"]] },
  { key: "models", title: "Asset Models", screens: [["Asset Models", "list"], ["Create Model", "settings"], ["Model Record", "record"], ["Model Categories", "list"]] },
  { key: "stockrooms", title: "Stockrooms", screens: [["Stockrooms", "list"], ["Create Stockroom", "settings"], ["Stockroom Record", "record"], ["Stockroom Inventory", "list"]] },
  { key: "inventory", title: "Inventory", screens: [["Inventory Home", "dashboard"], ["Inventory by Location", "list"], ["Inventory by Model", "list"], ["Inventory Exceptions", "list"]] },
  { key: "transfers", title: "Transfers", screens: [["Asset Transfers", "list"], ["Create Transfer", "settings"], ["Transfer Order", "record"], ["Transfer Lines", "record"], ["Ship Transfer", "record"], ["Receive Transfer", "record"]] },
  { key: "assignment", title: "Asset Assignment", screens: [["Assign Asset", "settings"], ["Return Asset", "record"], ["Swap Asset", "record"], ["Asset Assignment History", "list"]] },
  { key: "lifecycle", title: "Asset Lifecycle", screens: [["On Order Assets", "list"], ["In Stock Assets", "list"], ["In Use Assets", "list"], ["In Maintenance Assets", "list"], ["Retired Assets", "list"], ["Disposed Assets", "list"], ["Asset Disposal", "record"]] },
  { key: "audit", title: "Asset Audit", screens: [["Asset Audits", "list"], ["Create Audit", "settings"], ["Audit Tasks", "list"], ["Scan / Verify Asset", "record"], ["Audit Results", "report"], ["Asset Exceptions", "list"]] },
  { key: "cost", title: "Cost Management", screens: [["Cost Home", "dashboard"], ["Cost Centers", "list"], ["Cost Center Record", "record"], ["Cost Records", "list"], ["Asset Costs", "list"], ["Service Costs", "list"], ["Cost Allocation", "record"], ["Cost Reports", "report"]] },
  { key: "configuration", title: "Configuration", screens: [["Asset States", "record"], ["Asset Substates", "record"], ["Model Categories", "record"], ["Stockroom Configuration", "record"], ["Asset Properties", "record"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const assetManagementRoutes: AssetManagementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 150000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/assets/${module.key}/${slug(title)}`,
    group: `Phase 15 · ${module.title}`,
    phase: 15,
    kind,
    area: module.title,
    module: module.key,
    screenId: `15.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const assetManagementHomePath = assetManagementRoutes[0].path;
