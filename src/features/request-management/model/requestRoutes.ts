import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type RequestRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };
const modules: readonly Module[] = [
  { key: "home", title: "Request Home", screens: ["Request Home", "Request Dashboard"] },
  { key: "requests", title: "REQ", screens: ["Requests", "Open Requests", "Completed Requests", "Cancelled Requests", "REQ Record"] },
  { key: "requested-items", title: "RITM", screens: ["Requested Items", "My Group RITMs", "Open RITMs", "Awaiting Approval RITMs", "Fulfillment RITMs", "Completed RITMs", "RITM Record"] },
  { key: "catalog-tasks", title: "SCTASK", screens: ["Catalog Tasks", "My Catalog Tasks", "My Group Catalog Tasks", "Unassigned Catalog Tasks", "Open Catalog Tasks", "Completed Catalog Tasks", "SCTASK Record"] },
  { key: "fulfillment", title: "Fulfillment", screens: ["Fulfillment Plan", "Fulfillment Stages", "Generated Tasks", "Fulfillment Dependencies", "Fulfillment Exceptions"] },
  { key: "cancellation", title: "Cancellation", screens: ["Cancel Request", "Cancel Requested Item", "Cancellation Review"] },
  { key: "configuration", title: "Configuration", screens: ["Request State Models", "RITM State Models", "SCTASK State Models", "Fulfillment Rules", "Request Notifications", "Request SLA Mapping"] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard/i.test(title) ? "dashboard" : /record|review|plan|stages|dependencies|exceptions|cancel /i.test(title) ? "record" : "list";
export const requestRoutes: RequestRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: 60000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/requests/${module.key}/${slug(title)}`, group: `Phase 06 · ${module.title}`, phase: 6, kind: kindFor(title), area: module.title, module: module.key, screenId: `06.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed REQ, RITM, catalog-task, fulfillment, cancellation, SLA, and audit operations.` })));
export const requestHomePath = requestRoutes[0].path;
