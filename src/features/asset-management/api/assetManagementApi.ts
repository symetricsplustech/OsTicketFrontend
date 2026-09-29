/**
 * Phase 15 Asset & Cost Management API client.
 *
 * Mirrors the backend router mounted at /core/assets. Collections share one
 * list/create/update/delete shape, so the repetitive part is generated from a
 * table of resources; the stateful flows (transfers, assignment, lifecycle,
 * audits, cost approval) get explicit endpoints because their transitions are
 * not plain writes.
 */
import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecord, ApiRecordResponse } from "@shared/api/itsmTypes";
import {
  ASSET_ROOT,
  assetModelPath,
  assetPath,
  assignmentActionPath,
  assignmentPath,
  auditActionPath,
  auditExceptionPath,
  auditExceptionsPath,
  auditPath,
  auditResultsPath,
  auditScanPath,
  auditTaskPath,
  auditTasksPath,
  costActionPath,
  costAllocationsPath,
  costPath,
  costReportPath,
  lifecycleMovePath,
  lifecyclePath,
  lifecycleStatesPath,
  stockroomBalancePath,
  stockroomConfigurationPath,
  stockroomInventoryPath,
  transferActionPath,
  transferLinePath,
  transferLinesPath,
  transferPath,
  inventoryOverviewPath,
  type CrudResource,
} from "./assetPaths";

export { isCrudResource } from "./assetPaths";
export type { CrudResource } from "./assetPaths";

export type CrudListParams = {
  resource: CrudResource;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  direction?: "asc" | "desc";
  /** Column/value pairs applied as AND filters. */
  filters?: Record<string, string | number | boolean | undefined>;
};

export type TransferLine = {
  modelId?: string;
  assetId?: string;
  quantity: number;
  serialNumber?: string;
  notes?: string;
};

export type TransferOrder = {
  fromStockroomId?: string;
  toStockroomId?: string;
  fromLocation?: string;
  toLocation?: string;
  requestReason?: string;
  requestedDate?: string;
  notes?: string;
  lines: TransferLine[];
};

export type Assignee = {
  userId?: string;
  name: string;
  department?: string;
  location?: string;
};

export type ScanResult = "match" | "missing" | "unexpected" | "duplicate" | "damaged";

export type StockroomConfiguration = {
  allowNegativeStock: boolean;
  requireScanOnReceipt: boolean;
  requireApprovalOnTransfer: boolean;
  defaultReorderPoint: number;
  notes?: string;
};

export type InventoryOverview = {
  items: ApiRecord[];
  total: number;
  totals: {
    onHand: number;
    reserved: number;
    inTransit: number;
    available: number;
    lowStock: number;
  };
};

export type CostReport = {
  totals: { total: number; records: number };
  byType: Array<{ costType: string; total: number; count: number }>;
  byCostCenter: Array<{ costCenter: string; total: number; count: number }>;
  byMonth: Array<{ month: string; total: number; count: number }>;
  budgetUsage: Array<{
    id: string;
    code: string;
    name: string;
    budget: number;
    spent: number;
    remaining: number;
    utilizationPercent: number;
  }>;
};

export type LifecycleState = {
  id: string;
  _id: string;
  name: string;
  label: string;
  color?: string;
  sequence?: number;
  substates: Array<{ id: string; name: string; label: string; sequence?: number }>;
};

const tag = (id: string) => ({ type: "ItsmWork" as const, id: `assets/${id}` });

/** Tags a mutation should drop so the matching lists refetch. */
const invalidates = (...ids: string[]) => ids.map(tag);

/**
 * The asset register itself (Phase 15.1) predates the /core/assets router and
 * is served by the platform asset API, so the generic operational screens keep
 * using these four endpoints. Everything below `listAssetRecords` is the
 * Phase 15.2-15.10 module surface.
 */
export const assetRegisterApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAssets: build.query<ApiListResponse, { resource?: string; search?: string; status?: string }>({
      query: (params) => ({ url: "/enterprise/assets", params }),
      providesTags: [tag("register")],
    }),
    createAsset: build.mutation<ApiRecordResponse, { resource?: string; body: Record<string, unknown> }>({
      query: ({ body }) => ({ url: "/enterprise/assets", method: "POST", body }),
      invalidatesTags: [tag("register")],
    }),
    updateAsset: build.mutation<ApiRecordResponse, { resource?: string; id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/enterprise/assets/${id}`, method: "PUT", body }),
      invalidatesTags: [tag("register")],
    }),
    deleteAsset: build.mutation<{ success?: boolean }, { resource?: string; id: string }>({
      query: ({ id }) => ({ url: `/enterprise/assets/${id}`, method: "DELETE" }),
      invalidatesTags: [tag("register")],
    }),
  }),
});

export const { useListAssetsQuery, useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation } = assetRegisterApi;

export const assetManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ─── generic collections ───────────────────────────────────────────
    listAssetRecords: build.query<ApiListResponse, CrudListParams>({
      query: ({ resource, filters, limit, offset, orderBy, direction, ...params }) => ({
        url: assetPath(resource),
        params: {
          ...params,
          // Column filters travel as one JSON value because the query string
          // cannot express an object and repeated keys are ambiguous here.
          ...(filters && Object.keys(filters).length ? { filters: JSON.stringify(filters) } : {}),
          ...(limit ? { limit } : {}),
          ...(offset ? { offset } : {}),
          ...(orderBy ? { orderBy } : {}),
          ...(direction ? { direction } : {}),
        },
      }),
      providesTags: (_result, _error, { resource }) => [tag(resource)],
    }),
    createAssetRecord: build.mutation<ApiRecordResponse, { resource: CrudResource; body: Record<string, unknown> }>({
      query: ({ resource, body }) => ({ url: assetPath(resource), method: "POST", body }),
      invalidatesTags: (_result, _error, { resource }) => invalidates(resource, "config/lifecycle-states"),
    }),
    updateAssetRecord: build.mutation<ApiRecordResponse, { resource: CrudResource; id: string; body: Record<string, unknown> }>({
      query: ({ resource, id, body }) => ({ url: assetPath(resource, id), method: "PUT", body }),
      invalidatesTags: (_result, _error, { resource }) => invalidates(resource, "config/lifecycle-states"),
    }),
    deleteAssetRecord: build.mutation<{ success?: boolean }, { resource: CrudResource; id: string }>({
      query: ({ resource, id }) => ({ url: assetPath(resource, id), method: "DELETE" }),
      invalidatesTags: (_result, _error, { resource }) => invalidates(resource),
    }),

    // ─── 15.2 asset models ─────────────────────────────────────────────
    getAssetModel: build.query<ApiRecordResponse, string>({
      query: (id) => assetModelPath(id),
      providesTags: [tag("models")],
    }),

    // ─── 15.4 inventory ────────────────────────────────────────────────
    getStockroomInventory: build.query<ApiListResponse, { stockroomId: string; search?: string; lowStockOnly?: boolean }>({
      query: ({ stockroomId, ...params }) => ({ url: stockroomInventoryPath(stockroomId), params }),
      providesTags: [tag("inventory")],
    }),
    adjustStockroomBalance: build.mutation<ApiRecordResponse, { stockroomId: string; balanceId: string; body: Record<string, unknown> }>({
      query: ({ stockroomId, balanceId, body }) => ({ url: stockroomBalancePath(stockroomId, balanceId), method: "PUT", body }),
      invalidatesTags: invalidates("inventory", "inventory/exceptions"),
    }),
    getInventoryOverview: build.query<InventoryOverview, { location?: string; modelId?: string; lowStockOnly?: boolean }>({
      query: (params) => ({ url: inventoryOverviewPath(), params }),
      providesTags: [tag("inventory")],
    }),

    // ─── 15.5 transfers ────────────────────────────────────────────────
    getTransferOrder: build.query<ApiRecordResponse, string>({
      query: (id) => transferPath(id),
      providesTags: [tag("transfers")],
    }),
    listTransferLines: build.query<ApiListResponse, string>({
      query: (transferId) => transferLinesPath(transferId),
      providesTags: [tag("transfers")],
    }),
    createTransferLine: build.mutation<ApiRecordResponse, { transferId: string; body: TransferLine }>({
      query: ({ transferId, body }) => ({ url: transferLinesPath(transferId), method: "POST", body }),
      invalidatesTags: invalidates("transfers"),
    }),
    updateTransferLine: build.mutation<ApiRecordResponse, { transferId: string; lineId: string; body: Record<string, unknown> }>({
      query: ({ transferId, lineId, body }) => ({ url: transferLinePath(transferId, lineId), method: "PUT", body }),
      invalidatesTags: invalidates("transfers"),
    }),
    deleteTransferLine: build.mutation<{ success?: boolean }, { transferId: string; lineId: string }>({
      query: ({ transferId, lineId }) => ({ url: transferLinePath(transferId, lineId), method: "DELETE" }),
      invalidatesTags: invalidates("transfers"),
    }),
    createTransferOrder: build.mutation<ApiRecordResponse, { body: TransferOrder }>({
      query: ({ body }) => ({ url: transferPath(), method: "POST", body }),
      invalidatesTags: invalidates("transfers", "inventory"),
    }),
    requestTransfer: build.mutation<ApiRecordResponse, string>({
      query: (id) => ({ url: transferActionPath(id, "request"), method: "POST", body: {} }),
      invalidatesTags: invalidates("transfers"),
    }),
    shipTransfer: build.mutation<ApiRecordResponse, { id: string; carrier?: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: transferActionPath(id, "ship"), method: "POST", body }),
      invalidatesTags: invalidates("transfers", "inventory"),
    }),
    receiveTransfer: build.mutation<ApiRecordResponse, { id: string; receivedLines: Array<{ lineId: string; receivedQuantity: number }>; notes?: string }>({
      query: ({ id, ...body }) => ({ url: transferActionPath(id, "receive"), method: "POST", body }),
      invalidatesTags: invalidates("transfers", "inventory"),
    }),
    cancelTransfer: build.mutation<ApiRecordResponse, { id: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: transferActionPath(id, "cancel"), method: "POST", body }),
      invalidatesTags: invalidates("transfers", "inventory"),
    }),

    // ─── 15.6 assignment ───────────────────────────────────────────────
    assignAsset: build.mutation<ApiRecordResponse, { assetId: string; assignee: Assignee; notes?: string; dueBackAt?: string; assignmentType?: string }>({
      query: ({ assetId, ...body }) => ({ url: assignmentPath(), method: "POST", body: { assetId, ...body } }),
      invalidatesTags: invalidates("assignments", "lifecycle"),
    }),
    returnAsset: build.mutation<ApiRecordResponse, { assignmentId: string; condition: string; notes?: string }>({
      query: ({ assignmentId, ...body }) => ({ url: assignmentActionPath(assignmentId, "return"), method: "POST", body }),
      invalidatesTags: invalidates("assignments", "lifecycle"),
    }),
    swapAsset: build.mutation<ApiRecordResponse, { assignmentId: string; replacementAssetId: string; reason?: string }>({
      query: ({ assignmentId, replacementAssetId, reason }) => ({
        url: assignmentActionPath(assignmentId, "swap"),
        method: "POST",
        body: { replacementAssetId, reason },
      }),
      invalidatesTags: invalidates("assignments", "lifecycle"),
    }),

    // ─── 15.7 lifecycle ────────────────────────────────────────────────
    listAssetLifecycles: build.query<ApiListResponse, { state?: string } | void>({
      query: (params) => ({ url: lifecyclePath(), params: params ?? undefined }),
      providesTags: [tag("lifecycle")],
    }),
    moveAsset: build.mutation<ApiRecordResponse, { assetId: string; to: string; substate?: string; reason?: string; disposal?: Record<string, unknown> }>({
      query: ({ assetId, ...body }) => ({ url: lifecycleMovePath(assetId), method: "POST", body }),
      invalidatesTags: invalidates("lifecycle"),
    }),

    // ─── 15.8 asset audit ──────────────────────────────────────────────
    getAssetAudit: build.query<ApiRecordResponse, string>({
      query: (id) => auditPath(id),
      providesTags: [tag("audits")],
    }),
    startAssetAudit: build.mutation<ApiRecordResponse, string>({
      query: (id) => ({ url: auditActionPath(id, "start"), method: "POST", body: {} }),
      invalidatesTags: invalidates("audits"),
    }),
    completeAssetAudit: build.mutation<ApiRecordResponse, string>({
      query: (id) => ({ url: auditActionPath(id, "complete"), method: "POST", body: {} }),
      invalidatesTags: invalidates("audits", "audit-exceptions"),
    }),
    cancelAssetAudit: build.mutation<ApiRecordResponse, { id: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: auditActionPath(id, "cancel"), method: "POST", body }),
      invalidatesTags: invalidates("audits"),
    }),
    listAuditTasks: build.query<ApiListResponse, { auditId: string; status?: string }>({
      query: ({ auditId, ...params }) => ({ url: auditTasksPath(auditId), params }),
      providesTags: [tag("audits")],
    }),
    createAuditTask: build.mutation<ApiRecordResponse, { auditId: string; body: Record<string, unknown> }>({
      query: ({ auditId, body }) => ({ url: auditTasksPath(auditId), method: "POST", body }),
      invalidatesTags: invalidates("audits"),
    }),
    setAuditTaskStatus: build.mutation<ApiRecordResponse, { auditId: string; taskId: string; status: string; countedCount?: number }>({
      query: ({ auditId, taskId, ...body }) => ({ url: auditTaskPath(auditId, taskId), method: "PUT", body }),
      invalidatesTags: invalidates("audits"),
    }),
    deleteAuditTask: build.mutation<{ success?: boolean }, { auditId: string; taskId: string }>({
      query: ({ auditId, taskId }) => ({ url: auditTaskPath(auditId, taskId), method: "DELETE" }),
      invalidatesTags: invalidates("audits"),
    }),
    listAuditResults: build.query<ApiListResponse, { auditId: string; result?: ScanResult }>({
      query: ({ auditId, ...params }) => ({ url: auditResultsPath(auditId), params }),
      providesTags: [tag("audits")],
    }),
    recordAuditScan: build.mutation<ApiRecordResponse, { auditId: string; body: { taskId?: string; assetId?: string; barcode?: string; serialNumber?: string; result: ScanResult; note?: string } }>({
      query: ({ auditId, body }) => ({ url: auditScanPath(auditId), method: "POST", body }),
      invalidatesTags: invalidates("audits", "audit-exceptions"),
    }),
    listAuditExceptions: build.query<ApiListResponse, { openOnly?: boolean; auditId?: string } | void>({
      query: (params) => ({ url: auditExceptionsPath(), params: params ?? undefined }),
      providesTags: [tag("audit-exceptions")],
    }),
    resolveAuditException: build.mutation<ApiRecordResponse, { id: string; note?: string }>({
      query: ({ id, ...body }) => ({ url: auditExceptionPath(id), method: "PUT", body }),
      invalidatesTags: invalidates("audit-exceptions", "audits"),
    }),

    // ─── 15.9 cost management ──────────────────────────────────────────
    listCostAllocations: build.query<ApiListResponse, string>({
      query: (costId) => costAllocationsPath(costId),
      providesTags: [tag("costs")],
    }),
    createCostAllocation: build.mutation<ApiRecordResponse, { costId: string; body: { costCenterId?: string; department?: string; project?: string; allocationPercent?: number; allocatedAmount?: number; periodStart?: string; periodEnd?: string; note?: string } }>({
      query: ({ costId, body }) => ({ url: costAllocationsPath(costId), method: "POST", body }),
      invalidatesTags: invalidates("costs"),
    }),
    approveCost: build.mutation<ApiRecordResponse, { id: string; decision?: "approved" | "rejected" }>({
      query: ({ id, ...body }) => ({ url: costActionPath(id, "approve"), method: "POST", body }),
      invalidatesTags: invalidates("costs"),
    }),
    payCost: build.mutation<ApiRecordResponse, string>({
      query: (id) => ({ url: costActionPath(id, "pay"), method: "POST", body: {} }),
      invalidatesTags: invalidates("costs"),
    }),
    getCostReport: build.query<CostReport, { costCenterId?: string; from?: string; to?: string; costType?: string } | void>({
      query: (params) => ({ url: costReportPath(), params: params ?? undefined }),
      providesTags: [tag("costs")],
    }),

    // ─── 15.10 configuration ───────────────────────────────────────────
    getStockroomConfiguration: build.query<ApiRecordResponse, string>({
      query: (stockroomId) => stockroomConfigurationPath(stockroomId),
      providesTags: [tag("config/stockrooms")],
    }),
    saveStockroomConfiguration: build.mutation<ApiRecordResponse, { stockroomId: string; body: Partial<StockroomConfiguration> }>({
      query: ({ stockroomId, body }) => ({ url: stockroomConfigurationPath(stockroomId), method: "PUT", body }),
      invalidatesTags: invalidates("config/stockrooms"),
    }),
    listLifecycleStates: build.query<{ success?: boolean; items: LifecycleState[]; total: number }, void>({
      query: () => lifecycleStatesPath(),
      providesTags: [tag("config/lifecycle-states")],
    }),
  }),
});

export const {
  useListAssetRecordsQuery,
  useCreateAssetRecordMutation,
  useUpdateAssetRecordMutation,
  useDeleteAssetRecordMutation,
  useGetAssetModelQuery,
  useGetStockroomInventoryQuery,
  useAdjustStockroomBalanceMutation,
  useGetInventoryOverviewQuery,
  useGetTransferOrderQuery,
  useListTransferLinesQuery,
  useCreateTransferLineMutation,
  useUpdateTransferLineMutation,
  useDeleteTransferLineMutation,
  useCreateTransferOrderMutation,
  useRequestTransferMutation,
  useShipTransferMutation,
  useReceiveTransferMutation,
  useCancelTransferMutation,
  useAssignAssetMutation,
  useReturnAssetMutation,
  useSwapAssetMutation,
  useListAssetLifecyclesQuery,
  useMoveAssetMutation,
  useGetAssetAuditQuery,
  useStartAssetAuditMutation,
  useCompleteAssetAuditMutation,
  useCancelAssetAuditMutation,
  useListAuditTasksQuery,
  useCreateAuditTaskMutation,
  useSetAuditTaskStatusMutation,
  useDeleteAuditTaskMutation,
  useListAuditResultsQuery,
  useRecordAuditScanMutation,
  useListAuditExceptionsQuery,
  useResolveAuditExceptionMutation,
  useListCostAllocationsQuery,
  useCreateCostAllocationMutation,
  useApproveCostMutation,
  usePayCostMutation,
  useGetCostReportQuery,
  useGetStockroomConfigurationQuery,
  useSaveStockroomConfigurationMutation,
  useListLifecycleStatesQuery,
} = assetManagementApi;
