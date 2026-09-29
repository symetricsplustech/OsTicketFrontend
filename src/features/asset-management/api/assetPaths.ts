/**
 * URL builders for the Phase 15 Asset & Cost Management router.
 *
 * Kept separate from the RTK Query definitions so the paths can be asserted in
 * unit tests: the backend mounts this surface at /api/v1/core/assets and a
 * silent typo here would only surface as a 404 at runtime.
 */
export const ASSET_ROOT = "/core/assets";

/** Collections that behave like plain tenant-scoped CRUD. */
export type CrudResource =
  | "model-categories"
  | "models"
  | "stockrooms"
  | "inventory"
  | "inventory/exceptions"
  | "transfers"
  | "assignments"
  | "audits"
  | "audit-exceptions"
  | "costs"
  | "cost-centers"
  | "config/states"
  | "config/substates"
  | "config/properties";

export const isCrudResource = (value: string): value is CrudResource =>
  (CRUD_RESOURCES as string[]).includes(value);

export const CRUD_RESOURCES: CrudResource[] = [
  "model-categories",
  "models",
  "stockrooms",
  "inventory",
  "inventory/exceptions",
  "transfers",
  "assignments",
  "audits",
  "audit-exceptions",
  "costs",
  "cost-centers",
  "config/states",
  "config/substates",
  "config/properties",
];

/** `null` for a collection URL, otherwise the row URL. */
export const assetPath = (resource: CrudResource, id?: string) =>
  id ? `${ASSET_ROOT}/${resource}/${id}` : `${ASSET_ROOT}/${resource}`;

export const assetModelPath = (id?: string) => assetPath("models", id);

export const stockroomInventoryPath = (stockroomId: string) =>
  `${ASSET_ROOT}/stockrooms/${stockroomId}/inventory`;

export const stockroomBalancePath = (stockroomId: string, balanceId: string) =>
  `${ASSET_ROOT}/stockrooms/${stockroomId}/inventory/${balanceId}`;

export const inventoryOverviewPath = () => `${ASSET_ROOT}/inventory/overview`;

export const transferPath = (id?: string) => assetPath("transfers", id);
export const transferLinesPath = (transferId: string) => `${ASSET_ROOT}/transfers/${transferId}/lines`;
export const transferLinePath = (transferId: string, lineId: string) =>
  `${ASSET_ROOT}/transfers/${transferId}/lines/${lineId}`;
export const transferActionPath = (id: string, action: "request" | "ship" | "receive" | "cancel") =>
  `${ASSET_ROOT}/transfers/${id}/${action}`;

export const assignmentPath = (id?: string) => assetPath("assignments", id);
export const assignmentActionPath = (id: string, action: "return" | "swap") =>
  `${ASSET_ROOT}/assignments/${id}/${action}`;

export const lifecyclePath = () => `${ASSET_ROOT}/lifecycle`;
export const lifecycleMovePath = (assetId: string) => `${ASSET_ROOT}/lifecycle/${assetId}/move`;

export const auditPath = (id?: string) => assetPath("audits", id);
export const auditActionPath = (id: string, action: "start" | "complete" | "cancel") =>
  `${ASSET_ROOT}/audits/${id}/${action}`;
export const auditTasksPath = (auditId: string) => `${ASSET_ROOT}/audits/${auditId}/tasks`;
export const auditTaskPath = (auditId: string, taskId: string) =>
  `${ASSET_ROOT}/audits/${auditId}/tasks/${taskId}`;
export const auditResultsPath = (auditId: string) => `${ASSET_ROOT}/audits/${auditId}/results`;
export const auditScanPath = (auditId: string) => `${ASSET_ROOT}/audits/${auditId}/scan`;

export const auditExceptionsPath = () => assetPath("audit-exceptions");
export const auditExceptionPath = (id: string) => assetPath("audit-exceptions", id);

export const costPath = (id?: string) => assetPath("costs", id);
export const costActionPath = (id: string, action: "approve" | "pay") => `${ASSET_ROOT}/costs/${id}/${action}`;
export const costAllocationsPath = (costId: string) => `${ASSET_ROOT}/costs/${costId}/allocations`;
export const costReportPath = () => `${ASSET_ROOT}/costs/report`;

export const stockroomConfigurationPath = (stockroomId: string) =>
  `${ASSET_ROOT}/config/stockrooms/${stockroomId}`;
export const lifecycleStatesPath = () => `${ASSET_ROOT}/config/lifecycle-states`;
