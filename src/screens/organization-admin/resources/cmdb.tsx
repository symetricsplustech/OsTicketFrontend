import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListCiItemQuery,
  useListCiRelationshipQuery,
  useListAssetQuery,
  useListAssetModelQuery,
  useListAssetLicenseQuery,
  useListAssetMaintenanceQuery,
  useCreateAssetMaintenanceMutation,
  useListDiscoveryRunQuery,
  useCreateCiItemMutation,
  useCreateCiRelationshipMutation,
  useCreateAssetMutation,
  useCreateAssetModelMutation,
  useCreateAssetLicenseMutation,
  useCreateDiscoveryRunMutation,
  assetsApi,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CI_PATH = "/organization/cmdb-assets/cmdb/configuration-items";
const REL_PATH = "/organization/cmdb-assets/cmdb/ci-relationships";
const ASSET_PATH = "/organization/cmdb-assets/asset-management/all-assets";
const MODEL_PATH = "/organization/cmdb-assets/asset-management/asset-models";
const LICENSE_PATH = "/organization/cmdb-assets/asset-management/license-records";
const MAINTENANCE_PATH = "/organization/cmdb-assets/asset-management/maintenance-schedules";
const DISCOVERY_PATH = "/organization/cmdb-assets/discovery/discovery-configuration";

const ciColumns: Column<any>[] = [
  { key: "name", header: "CI Name", render: (row: any) => row.name },
  { key: "ciType", header: "Type", render: (row: any) => row.ciType?.name || "-" },
  { key: "environment", header: "Environment", render: (row: any) => row.environment || "-" },
  { key: "owner", header: "Owner", render: (row: any) => row.owner?.displayName || "-" },
  statusColumn<any>("status"),
];

const relColumns: Column<any>[] = [
  { key: "source", header: "Source CI", render: (row: any) => row.sourceCi?.name || "-" },
  { key: "target", header: "Target CI", render: (row: any) => row.targetCi?.name || "-" },
  { key: "type", header: "Relationship", render: (row: any) => row.relationshipType },
  statusColumn<any>("status"),
];

const assetColumns: Column<any>[] = [
  { key: "name", header: "Asset", render: (row: any) => row.name },
  { key: "assetTag", header: "Asset Tag", render: (row: any) => row.assetTag },
  { key: "model", header: "Model", render: (row: any) => row.model?.name || "-" },
  { key: "owner", header: "Owner", render: (row: any) => row.owner?.displayName || "-" },
  { key: "location", header: "Location", render: (row: any) => row.location?.name || "-" },
  statusColumn<any>("status"),
];

const modelColumns: Column<any>[] = [
  { key: "name", header: "Model", render: (row: any) => row.name },
  { key: "vendor", header: "Vendor", render: (row: any) => row.vendor },
  { key: "category", header: "Category", render: (row: any) => row.category },
  statusColumn<any>("status"),
];

const licenseColumns: Column<any>[] = [
  { key: "name", header: "License", render: (row: any) => row.name },
  { key: "vendor", header: "Vendor", render: (row: any) => row.vendor },
  { key: "type", header: "Type", render: (row: any) => row.licenseType },
  { key: "seats", header: "Seats", render: (row: any) => row.totalSeats },
  { key: "used", header: "Used", render: (row: any) => row.usedSeats },
  statusColumn<any>("status"),
];

const maintenanceColumns: Column<any>[] = [
  { key: "summary", header: "Maintenance", render: (row: any) => row.summary },
  { key: "kind", header: "Type", render: (row: any) => row.kind || "-" },
  { key: "assetId", header: "Asset", render: (row: any) => row.assetId || "-" },
  { key: "scheduledAt", header: "Scheduled", render: (row: any) => row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : "-" },
  { key: "completedAt", header: "Completed", render: (row: any) => row.completedAt ? new Date(row.completedAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const discoveryColumns: Column<any>[] = [
  { key: "name", header: "Discovery Run", render: (row: any) => row.name },
  { key: "source", header: "Source", render: (row: any) => row.sourceType },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  { key: "found", header: "Found", render: (row: any) => row.foundCount ?? 0 },
  statusColumn<any>("status"),
];

export const cmdbConfigs: ResourceListConfig[] = [
  {
    path: CI_PATH,
    title: "Configuration Items",
    description: "CMDB configuration items and relationships",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: ciColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCiItemQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.ciType?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "In Service", value: "IN_SERVICE" },
          { label: "In Stock", value: "IN_STOCK" },
          { label: "In Repair", value: "IN_REPAIR" },
          { label: "Retired", value: "RETIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${CI_PATH}/${row.id}`,
    create: {
      title: "Create CI",
      description: "Create a new configuration item.",
      fields: [
        { key: "name", label: "CI name", type: "text", required: true },
        { key: "ciTypeId", label: "CI type ID", type: "text", required: true },
        { key: "environment", label: "Environment", type: "text" },
        { key: "ownerId", label: "Owner ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateCiItemMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, ciTypeId: values.ciTypeId, environment: values.environment, ownerId: values.ownerId }),
      successMessage: "CI created",
    },
  },
  {
    path: REL_PATH,
    title: "CI Relationships",
    description: "Dependencies and relationships between CIs",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: relColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListCiRelationshipQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.sourceCi?.name || ""} ${row.targetCi?.name || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${REL_PATH}/${row.id}`,
    create: {
      title: "Create Relationship",
      description: "Create a new CI relationship.",
      fields: [
        { key: "sourceCiId", label: "Source CI ID", type: "text", required: true },
        { key: "targetCiId", label: "Target CI ID", type: "text", required: true },
        { key: "relationshipType", label: "Relationship type", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateCiRelationshipMutation),
      buildBody: (values: Record<string, unknown>) => ({ sourceCiId: values.sourceCiId, targetCiId: values.targetCiId, relationshipType: values.relationshipType }),
      successMessage: "Relationship created",
    },
  },
  {
    path: ASSET_PATH,
    title: "All Assets",
    description: "Hardware and software asset inventory",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: assetColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAssetQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.assetTag} ${row.model?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "In Service", value: "IN_SERVICE" },
          { label: "In Stock", value: "IN_STOCK" },
          { label: "In Repair", value: "IN_REPAIR" },
          { label: "Retired", value: "RETIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${ASSET_PATH}/${row.id}`,
    create: {
      title: "Create Asset",
      description: "Create a new asset.",
      fields: [
        { key: "name", label: "Asset name", type: "text", required: true },
        { key: "assetTag", label: "Asset tag", type: "text", required: true },
        { key: "modelId", label: "Model ID", type: "text", required: true },
        { key: "ownerId", label: "Owner ID", type: "text" },
        { key: "locationId", label: "Location ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateAssetMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, assetTag: values.assetTag, modelId: values.modelId, ownerId: values.ownerId, locationId: values.locationId }),
      successMessage: "Asset created",
    },
  },
  {
    path: MODEL_PATH,
    title: "Asset Models",
    description: "Standardized hardware/software models",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: modelColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAssetModelQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.vendor || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${MODEL_PATH}/${row.id}`,
    create: {
      title: "Create Model",
      description: "Create a new asset model.",
      fields: [
        { key: "name", label: "Model name", type: "text", required: true },
        { key: "vendor", label: "Vendor", type: "text" },
        { key: "category", label: "Category", type: "text" },
      ],
      useCreate: asMutationHook(useCreateAssetModelMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, vendor: values.vendor, category: values.category }),
      successMessage: "Model created",
    },
  },
  {
    path: LICENSE_PATH,
    title: "License Records",
    description: "Software license tracking and compliance",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: licenseColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAssetLicenseQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.vendor}`,
    pageSize: 20,
    detailPath: (row: any) => `${LICENSE_PATH}/${row.id}`,
    create: {
      title: "Create License",
      description: "Create a new license record.",
      fields: [
        { key: "name", label: "License name", type: "text", required: true },
        { key: "vendor", label: "Vendor", type: "text", required: true },
        { key: "licenseType", label: "License type", type: "text", required: true },
        { key: "totalSeats", label: "Total seats", type: "number", required: true },
      ],
      useCreate: asMutationHook(useCreateAssetLicenseMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, vendor: values.vendor, licenseType: values.licenseType, totalSeats: Number(values.totalSeats) }),
      successMessage: "License created",
    },
  },
  {
    path: MAINTENANCE_PATH,
    title: "Maintenance Schedules",
    description: "Asset maintenance schedules and completion tracking",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: maintenanceColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListAssetMaintenanceQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.summary} ${row.kind || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Cancelled", value: "CANCELLED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${MAINTENANCE_PATH}/${row.id}`,
    create: {
      title: "Schedule Maintenance",
      description: "Schedule a new asset maintenance record.",
      fields: [
        { key: "summary", label: "Summary", type: "text", required: true },
        { key: "assetId", label: "Asset ID", type: "text", required: true },
        { key: "kind", label: "Type", type: "text" },
        { key: "scheduledAt", label: "Scheduled at", type: "text" },
      ],
      useCreate: asMutationHook(useCreateAssetMaintenanceMutation),
      buildBody: (values: Record<string, unknown>) => ({ summary: values.summary, assetId: values.assetId, kind: values.kind, scheduledAt: values.scheduledAt }),
      successMessage: "Maintenance scheduled",
    },
  },
  {
    path: DISCOVERY_PATH,
    title: "Discovery Configuration",
    description: "Automated discovery schedules and results",
    sectionLabel: "CMDB & Assets",
    rowId: "id",
    columns: discoveryColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListDiscoveryRunQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${DISCOVERY_PATH}/${row.id}`,
    create: {
      title: "Start Discovery Run",
      description: "Start a new automated discovery run.",
      fields: [
        { key: "name", label: "Run name", type: "text", required: true },
        { key: "sourceType", label: "Source type", type: "text", required: true },
        { key: "credentials", label: "Credentials (JSON)", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateDiscoveryRunMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, sourceType: values.sourceType, credentials: values.credentials ? JSON.parse(values.credentials as string) : {} }),
      successMessage: "Discovery run started",
    },
  },
];