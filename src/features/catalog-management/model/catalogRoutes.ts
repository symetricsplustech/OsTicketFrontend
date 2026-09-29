import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type CatalogRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };
const modules: readonly Module[] = [
  { key: "catalogs", title: "Catalogs", screens: ["Catalog Home", "Catalogs", "Create Catalog", "Catalog Record", "Catalog Categories", "Catalog Items", "Catalog Audience", "Catalog Analytics"] },
  { key: "categories", title: "Categories", screens: ["Categories", "Create Category", "Category Record", "Subcategories", "Category Ordering"] },
  { key: "items", title: "Catalog Items", screens: ["Catalog Items", "Create Catalog Item", "Catalog Item Builder", "Catalog Item Record", "Item Preview", "Item Versions", "Clone Item", "Publish Item", "Retire Item"] },
  { key: "variables", title: "Variables", screens: ["Variables", "Variable Editor", "Variable Types", "Variable Ordering", "Variable Validation", "Reference Variable", "Lookup Variable", "Attachment Variable"] },
  { key: "variable-sets", title: "Variable Sets", screens: ["Variable Sets", "Create Variable Set", "Variable Set Record", "Multi-Row Variable Sets", "Attach Variable Set"] },
  { key: "ui-policies", title: "Catalog UI Policies", screens: ["Catalog UI Policies", "Create UI Policy", "Policy Conditions", "Policy Actions", "Policy Test"] },
  { key: "user-criteria", title: "User Criteria", screens: ["User Criteria", "Create User Criteria", "Available For", "Not Available For", "Criteria Test"] },
  { key: "order-guides", title: "Order Guides", screens: ["Order Guides", "Create Order Guide", "Order Guide Builder", "Rule Base", "Included Items", "Order Guide Preview"] },
  { key: "record-producers", title: "Record Producers", screens: ["Record Producers", "Create Record Producer", "Producer Variables", "Target Record Mapping", "Producer Preview"] },
  { key: "fulfillment", title: "Catalog Fulfillment", screens: ["Fulfillment Flows", "Catalog Task Templates", "Approval Mapping", "Assignment Mapping", "SLA Mapping"] },
  { key: "pricing", title: "Pricing & Cost Display", screens: ["Item Price", "Recurring Price", "Cost Display", "Price Summary"] },
  { key: "shopping", title: "Requester Shopping", screens: ["Browse Catalog", "Catalog Search", "Category Page", "Item Page", "Item Configuration", "Add to Cart", "Saved Cart", "Cart", "Checkout", "Order Confirmation"] },
  { key: "configuration", title: "Configuration", screens: ["Catalog Properties", "Catalog Search Configuration", "Catalog Notifications", "Catalog Taxonomy"] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home$|analytics$/i.test(title) ? "dashboard" : /create |builder|editor|clone |publish |retire |configuration$|add to cart|checkout/i.test(title) ? "settings" : /catalogs$|categories$|catalog items$|variables$|variable sets$|policies$|criteria$|order guides$|record producers$|flows$|templates$|browse catalog|catalog search|saved cart$|cart$/i.test(title) ? "list" : "record";
export const catalogRoutes: CatalogRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: 70000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/catalog/${module.key}/${slug(title)}`, group: `Phase 07 · ${module.title}`, phase: 7, kind: kindFor(title), area: module.title, module: module.key, screenId: `07.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed catalog design, variables, policies, criteria, fulfillment, pricing, shopping, publication, and audit operations.` })));
export const catalogHomePath = catalogRoutes[0].path;
