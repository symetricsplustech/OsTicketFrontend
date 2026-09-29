import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type UniversalRequestRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };
const modules: readonly Module[] = [
  { key: "home", title: "Universal Request Home", screens: ["Universal Request Home", "Universal Request Dashboard"] },
  { key: "requester", title: "Requester", screens: ["Create Universal Request", "My Universal Requests", "Universal Request Detail"] },
  { key: "agent", title: "Agent", screens: ["Universal Request Queue", "Universal Request Record", "Transfer Request", "Transfer History", "Create Child Task", "Create Incident", "Create Request", "Link Existing Record"] },
  { key: "configuration", title: "Configuration", screens: ["Universal Request Routing", "Transfer Rules", "State Model", "Notifications", "Universal Request Properties"] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard/i.test(title) ? "dashboard" : /create |transfer request|link existing/i.test(title) ? "settings" : /my universal|queue|routing|rules$|notifications$|properties$/i.test(title) ? "list" : "record";
export const universalRequestRoutes: UniversalRequestRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: 80000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/universal-requests/${module.key}/${slug(title)}`, group: `Phase 08 · ${module.title}`, phase: 8, kind: kindFor(title), area: module.title, module: module.key, screenId: `08.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed universal-request routing, transfers, child work, conversion, linking, lifecycle, and audit operations.` })));
export const universalRequestHomePath = universalRequestRoutes[0].path;
