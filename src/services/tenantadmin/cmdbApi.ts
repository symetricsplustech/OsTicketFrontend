import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess } from "@services/http";

export interface CiItem {
  id: string;
  name: string;
  ciTypeKey: string | null;
  status: string;
  criticality: string;
  environment: string | null;
  ownerId: string | null;
  supportTeamId: string | null;
  serialNumber: string | null;
  assetTag: string | null;
  ipAddress: string | null;
  hostname: string | null;
  locationId: string | null;
  attributes: Record<string, unknown> | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CiRelationship {
  id: string;
  sourceCiId: string;
  targetCiId: string;
  typeKey: string | null;
  description: string | null;
  createdAt: string;
  source?: { id: string; name: string } | null;
  target?: { id: string; name: string } | null;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  categoryKey: string | null;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  model: string | null;
  manufacturer: string | null;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  cost: number | null;
  currency: string | null;
  assignedToId: string | null;
  locationId: string | null;
  ciId: string | null;
  vendorId: string | null;
  notes: string | null;
  attributes: Record<string, unknown> | null;
  retiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AssetMaintenance {
  id: string;
  assetId: string | null;
  kind: string | null;
  status: string;
  summary: string;
  description: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  cost: number | null;
  performedById: string | null;
  createdAt: string;
}

export interface AssetModel {
  id: string;
  name: string;
  manufacturer: string | null;
  category: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AssetLicense {
  id: string;
  name: string;
  vendor: string | null;
  hasLicenseKey: boolean;
  seats: number | null;
  usedSeats: number | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryRun {
  id: string;
  name: string | null;
  profileKey: string | null;
  mode: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  discoveredCount: number;
  importedCount: number;
  error: string | null;
  createdAt: string;
}

export interface DiscoveryResult {
  id: string;
  runId: string;
  identifier: string;
  kind: string | null;
  data: Record<string, unknown> | null;
  status: string;
  action: string | null;
  matchedCiId: string | null;
  createdAt: string;
}

export const CMDB_ITEMS_PATH = "/itsm/cmdb/items";
export const CMDB_RELATIONSHIPS_PATH = "/itsm/cmdb/relationships";
export const ASSETS_PATH = "/itsm/assets";
export const ASSET_MAINTENANCE_PATH = "/itsm/assets/maintenance";
export const DISCOVERY_RUNS_PATH = "/itsm/discovery/runs";
export const DISCOVERY_RESULTS_PATH = "/itsm/discovery/results";

export const cmdbApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<CiItem, "CiItem">(build, {
      path: CMDB_ITEMS_PATH,
      tag: "CiItem",
    }),
    ...crudEndpoints<CiRelationship, "CiRelationship">(build, {
      path: CMDB_RELATIONSHIPS_PATH,
      tag: "CiRelationship",
    }),
  }),
});

export const {
  useListCiItemQuery,
  useGetCiItemQuery,
  useCreateCiItemMutation,
  useUpdateCiItemMutation,
  useDeleteCiItemMutation,
  useListCiRelationshipQuery,
  useGetCiRelationshipQuery,
  useCreateCiRelationshipMutation,
  useUpdateCiRelationshipMutation,
  useDeleteCiRelationshipMutation,
} = cmdbApi;

export const assetsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Asset, "Asset">(build, {
      path: ASSETS_PATH,
      tag: "Asset",
    }),
    assignAsset: transitionEndpoint<Asset, "Asset">(
      build,
      ASSETS_PATH,
      "Asset",
      "/assign",
    ),
    returnAsset: transitionEndpoint<Asset, "Asset">(
      build,
      ASSETS_PATH,
      "Asset",
      "/return",
    ),
    retireAsset: transitionEndpoint<Asset, "Asset">(
      build,
      ASSETS_PATH,
      "Asset",
      "/retire",
    ),
    listAssetMaintenanceForAsset: build.query<
      ListResponse<AssetMaintenance>,
      { assetId: string } & ListArgs
    >({
      query: ({ assetId, ...args }) => ({
        url: `${resourceUrl(ASSETS_PATH, assetId)}/maintenance${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "AssetMaintenance", id: args.assetId },
      ],
    }),
    createAssetMaintenanceForAsset: build.mutation<
      ApiSuccess<AssetMaintenance>,
      { assetId: string; body: Record<string, unknown> }
    >({
      query: ({ assetId, body }) => ({
        url: `${resourceUrl(ASSETS_PATH, assetId)}/maintenance`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AssetMaintenance"],
    }),
    ...crudEndpoints<AssetMaintenance, "AssetMaintenance">(build, {
      path: ASSET_MAINTENANCE_PATH,
      tag: "AssetMaintenance",
    }),
    completeAssetMaintenance: transitionEndpoint<
      AssetMaintenance,
      "AssetMaintenance"
    >(build, ASSET_MAINTENANCE_PATH, "AssetMaintenance", "/complete"),
  }),
});

export const {
  useListAssetQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useAssignAssetMutation,
  useReturnAssetMutation,
  useRetireAssetMutation,
  useListAssetMaintenanceForAssetQuery,
  useCreateAssetMaintenanceForAssetMutation,
  useListAssetMaintenanceQuery,
  useCreateAssetMaintenanceMutation,
  useGetAssetMaintenanceQuery,
  useUpdateAssetMaintenanceMutation,
  useDeleteAssetMaintenanceMutation,
  useCompleteAssetMaintenanceMutation,
} = assetsApi;

export const assetConfigApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<AssetModel, "AssetModel">(build, {
      path: "/itsm/asset-config/models",
      tag: "AssetModel",
    }),
    ...crudEndpoints<AssetLicense, "AssetLicense">(build, {
      path: "/itsm/asset-config/licenses",
      tag: "AssetLicense",
    }),
  }),
});

export const {
  useListAssetModelQuery,
  useGetAssetModelQuery,
  useCreateAssetModelMutation,
  useUpdateAssetModelMutation,
  useDeleteAssetModelMutation,
  useListAssetLicenseQuery,
  useGetAssetLicenseQuery,
  useCreateAssetLicenseMutation,
  useUpdateAssetLicenseMutation,
  useDeleteAssetLicenseMutation,
} = assetConfigApi;

export const discoveryApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<DiscoveryRun, "DiscoveryRun">(build, {
      path: DISCOVERY_RUNS_PATH,
      tag: "DiscoveryRun",
    }),
    startDiscoveryRun: transitionEndpoint<DiscoveryRun, "DiscoveryRun">(
      build,
      DISCOVERY_RUNS_PATH,
      "DiscoveryRun",
      "/start",
    ),
    completeDiscoveryRun: transitionEndpoint<DiscoveryRun, "DiscoveryRun">(
      build,
      DISCOVERY_RUNS_PATH,
      "DiscoveryRun",
      "/complete",
    ),
    failDiscoveryRun: transitionEndpoint<DiscoveryRun, "DiscoveryRun">(
      build,
      DISCOVERY_RUNS_PATH,
      "DiscoveryRun",
      "/fail",
    ),
    listDiscoveryRunResults: build.query<
      ListResponse<DiscoveryResult>,
      { runId: string } & ListArgs
    >({
      query: ({ runId, ...args }) => ({
        url: `${resourceUrl(DISCOVERY_RUNS_PATH, runId)}/results${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "DiscoveryResult", id: args.runId },
      ],
    }),
    ...crudEndpoints<DiscoveryResult, "DiscoveryResult">(build, {
      path: DISCOVERY_RESULTS_PATH,
      tag: "DiscoveryResult",
    }),
  }),
});

export const {
  useListDiscoveryRunQuery,
  useGetDiscoveryRunQuery,
  useCreateDiscoveryRunMutation,
  useUpdateDiscoveryRunMutation,
  useDeleteDiscoveryRunMutation,
  useStartDiscoveryRunMutation,
  useCompleteDiscoveryRunMutation,
  useFailDiscoveryRunMutation,
  useListDiscoveryRunResultsQuery,
  useListDiscoveryResultQuery,
  useGetDiscoveryResultQuery,
  useUpdateDiscoveryResultMutation,
  useDeleteDiscoveryResultMutation,
} = discoveryApi;
