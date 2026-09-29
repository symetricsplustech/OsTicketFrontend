import type { ScreenDefinition } from "@features/itsm-core/models/screen";

export type OperationalDomain = "assignment" | "approval" | "configuration" | "service-portfolio" | "asset" | "outage" | "on-call" | "walk-up" | "portfolio" | "release";

/**
 * What a screen actually reads. `resource` is the collection the operational
 * workspace lists; `status` narrows the asset register for the 15.7 lifecycle
 * screens; `readOnly` marks screens whose rows live behind a parent-scoped or
 * non-CRUD endpoint, where offering create/edit/delete would call a path the API
 * does not serve.
 */
export type OperationalTarget = {
  resource: string;
  status?: string;
  readOnly?: boolean;
  /**
   * Set when a screen has no backend surface yet. The reason is carried through
   * so the screen can say so, instead of being fed another module's records —
   * which is what the previous catch-all mapping did.
   */
  unavailable?: string;
};

export function operationalDomain(screen: ScreenDefinition): OperationalDomain {
  if (screen.phase === 11) return "assignment";
  if (screen.phase === 12) return "approval";
  if (screen.phase === 13) return "configuration";
  if (screen.phase === 14) return "service-portfolio";
  if (screen.phase === 15) return "asset";
  if (screen.phase === 16) return "outage";
  if (screen.phase === 17) return "on-call";
  if (screen.phase === 18) return "walk-up";
  if (screen.phase === 19) return "portfolio";
  return "release";
}

export function operationalResource(screen: ScreenDefinition): string {
  return operationalTarget(screen).resource;
}


/**
 * Phase 15 screens grouped by the collection they read.
 *
 * Before this map existed every phase 15 module resolved to "assets", so the
 * models, stockroom, inventory, transfer, assignment, audit, cost and
 * configuration screens all listed the asset register.
 *
 * Screens whose rows belong to a parent record (stockroom inventory, transfer
 * lines, audit tasks and results, cost allocation, stockroom configuration) list
 * their parent collection read-only rather than guessing at a child id the route
 * does not carry. They need dedicated nested views, which the master spec still
 * lists as open.
 */
const PHASE16_MODULES: Record<string, string> = {
  outages: "outages",
  impact: "outages",
  relationships: "outages",
  communications: "outages",
  // 16.5 Service Status is a separate backend mount, not a sub-path of
  // /core/outage, so it gets its own resource and cache tag.
  status: "status-pages",
  configuration: "outages",
};

const PHASE16_SCREENS: Record<string, OperationalTarget> = {
  // 16.1 Outages — the dashboard already treats these three as "active".
  "Active Outages": { resource: "outages", status: "investigating,identified,monitoring" },
  "Resolved Outages": { resource: "outages", status: "resolved" },
  "Closed Outages": { resource: "outages", status: "closed" },
  // There is no planned/scheduled status in the transition map, so a planned
  // outage is a date property rather than a filterable state.
  "Planned Outages": { resource: "outages", unavailable: "Outages have no planned status; planned work is a plannedStart date range, which the outage list does not filter on" },
  // 16.2 Outage Impact — affected services, CIs and the timeline are child
  // collections of a single outage, so they read the outage and are not edited
  // as a flat list.
  "Affected Service": { resource: "outages", readOnly: true },
  "Affected CI": { resource: "outages", readOnly: true },
  "Impact Timeline": { resource: "outages", readOnly: true },
  "Affected Users / Locations": { resource: "outages", unavailable: "The outage API records affected CIs and services only; it has no user or location impact endpoint" },
  // 16.3 Outage Relationships — linked through /outages/:id/relations.
  "Related Incidents": { resource: "outages", readOnly: true },
  "Major Incident": { resource: "outages", readOnly: true },
  "Related Change": { resource: "outages", readOnly: true },
  // 16.4 Outage Communications.
  "Outage Communication": { resource: "outages", readOnly: true },
  "Stakeholder Update": { resource: "outages", readOnly: true },
  // The router can send a communication and store a plan, but exposes no
  // history endpoint to read past sends back.
  "Communication History": { resource: "outages", unavailable: "The outage router can send a communication and store a plan but exposes no communication history endpoint" },
  // 16.6 Configuration — the outage router has no configuration endpoints;
  // outage types, states and notifications are not separate collections.
  "Outage Types": { resource: "outages", unavailable: "The outage router exposes no outage type configuration endpoint" },
  "Outage States": { resource: "outages", unavailable: "Outage states are the transition map in outageService, not a configurable collection" },
  "Outage Notifications": { resource: "outages", unavailable: "Notification rules are not exposed by the outage router" },
  "Service Status Configuration": { resource: "outages", unavailable: "Status page components and subscriptions are not exposed by an API" },
};

const PHASE15_SCREENS: Record<string, OperationalTarget> = {
  // 15.2 Asset Models
  "Model Categories": { resource: "model-categories" },
  // 15.3 Stockrooms
  "Stockroom Inventory": { resource: "stockrooms", readOnly: true },
  // 15.4 Inventory
  "Inventory Exceptions": { resource: "inventory/exceptions" },
  // 15.5 Transfers
  "Transfer Lines": { resource: "transfers", readOnly: true },
  "Ship Transfer": { resource: "transfers", readOnly: true },
  "Receive Transfer": { resource: "transfers", readOnly: true },
  // 15.6 Asset Assignment
  "Return Asset": { resource: "assignments", readOnly: true },
  "Swap Asset": { resource: "assignments", readOnly: true },
  // 15.7 Asset Lifecycle — the six states are asset statuses on the register.
  "On Order Assets": { resource: "assets", status: "on_order", readOnly: true },
  "In Stock Assets": { resource: "assets", status: "in_stock", readOnly: true },
  "In Use Assets": { resource: "assets", status: "in_use", readOnly: true },
  "In Maintenance Assets": { resource: "assets", status: "in_maintenance", readOnly: true },
  "Retired Assets": { resource: "assets", status: "retired", readOnly: true },
  "Disposed Assets": { resource: "assets", status: "disposed", readOnly: true },
  "Asset Disposal": { resource: "assets", readOnly: true },
  // 15.8 Asset Audit
  "Audit Tasks": { resource: "audits", readOnly: true },
  "Audit Results": { resource: "audits", readOnly: true },
  "Scan / Verify Asset": { resource: "audits", readOnly: true },
  "Asset Exceptions": { resource: "audit-exceptions" },
  // 15.9 Cost Management
  "Cost Centers": { resource: "cost-centers" },
  "Cost Center Record": { resource: "cost-centers" },
  "Cost Allocation": { resource: "costs", readOnly: true },
  "Cost Reports": { resource: "costs", readOnly: true },
  // 15.10 Configuration
  "Asset Substates": { resource: "config/substates" },
  "Asset Properties": { resource: "config/properties" },
  "Stockroom Configuration": { resource: "stockrooms", readOnly: true },
};

/** Collection each Phase 15 module reads by default. */
const PHASE15_MODULES: Record<string, string> = {
  assets: "assets",
  models: "models",
  stockrooms: "stockrooms",
  inventory: "inventory",
  transfers: "transfers",
  assignment: "assignments",
  lifecycle: "assets",
  audit: "audits",
  cost: "costs",
  configuration: "config/states",
};

export function operationalTarget(screen: ScreenDefinition): OperationalTarget {
  const domain = operationalDomain(screen);
  // Phase 11 maps to the assignment API's own resources. The remaining modules
  // used to fall through to "routing-rules", which showed routing rule data on
  // the Assignment, Capacity and Availability screens.
  if (domain === "assignment") return { resource: screen.module === "skills" ? "skills" : screen.module === "queues" ? "queues" : screen.module === "routing-rules" ? "routing-rules" : screen.module === "capacity" ? "capacity" : screen.module === "availability" ? "presence" : "dashboard" };
  if (domain === "approval") return { resource: screen.module === "delegation" ? "delegations" : screen.module === "policies" ? "definitions" : "instances" };
  if (domain === "configuration") return { resource: screen.module === "relationships" ? "relationships" : "cis" };
  if (domain === "service-portfolio") return { resource: screen.module === "technical-services" ? "technical-services" : screen.module === "service-offerings" ? "service-offerings" : "business-services" };
  if (domain === "on-call") return { resource: screen.module === "rotations" ? "rotations" : screen.module === "rosters" ? "rosters" : screen.module === "coverage" || screen.module === "overrides" ? "coverage" : screen.module === "escalation" ? "escalation-policies" : "schedules" };
  if (domain === "walk-up") return { resource: screen.module === "appointments" ? "appointments" : screen.module === "locations" ? "locations" : screen.module === "kiosks" ? "kiosks" : screen.module === "queue" ? "queues" : "services" };
  if (domain === "release") return { resource: screen.module === "tasks" ? "tasks" : "releases" };
  if (domain === "portfolio") return { resource: "portfolios" };
  if (domain === "outage") {
    const override = PHASE16_SCREENS[screen.title];
    if (override) return override;
    return { resource: PHASE16_MODULES[screen.module ?? ""] ?? "outages" };
  }
  if (domain === "asset") {
    // A screen-specific entry wins over the module default, so 15.4 can show
    // inventory exceptions while 15.10 shows asset properties.
    const override = PHASE15_SCREENS[screen.title];
    if (override) return override;
    const resource = PHASE15_MODULES[screen.module ?? ""] ?? "assets";
    return { resource };
  }
  return { resource: "assets" };
}
