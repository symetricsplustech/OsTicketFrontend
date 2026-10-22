import { Settings, Boxes, Package, RefreshCw } from "lucide-react";
import { asQueryHook, asMutationHook } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol } from "./columns";
import {
  useListCiTypesQuery,
  useCreateCiTypeMutation,
  useListAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useListRelationshipTypesQuery,
  useCreateRelationshipTypeMutation,
  useListDiscoveryProfilesQuery,
  useCreateDiscoveryProfileMutation,
} from "@services/saasadmin";

const SECTION = "CMDB & Asset Management";

export const CMDB_ASSET_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/cmdb-asset-management/cmdb-config",
    title: "CMDB Configuration",
    description:
      "Discovery profiles that define how configuration items are discovered and synced.",
    sectionLabel: SECTION,
    rowId: "profileId",
    source: {
      kind: "api",
      useList: asQueryHook(useListDiscoveryProfilesQuery),
    },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Profile"),
      textCol("mode", "Mode"),
      textCol("schedule", "Schedule"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.mode}`,
    create: {
      title: "Create Discovery Profile",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "mode", label: "Mode", type: "text" },
        { key: "schedule", label: "Schedule", type: "text" },
      ],
      useCreate: asMutationHook(useCreateDiscoveryProfileMutation),
    },
    stats: [
      {
        key: "total",
        label: "Profiles",
        compute: (rows) => rows.length,
        icon: <Settings className="h-5 w-5" />,
      },
      {
        key: "enabled",
        label: "Enabled",
        compute: (rows) => rows.filter((r) => r.isEnabled).length,
        color: "success",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/ci-types",
    title: "CI Types",
    description: "Configuration item types that define the CMDB schema.",
    sectionLabel: SECTION,
    rowId: "typeId",
    source: { kind: "api", useList: asQueryHook(useListCiTypesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Type"),
      textCol("description", "Description"),
      textCol("fields", "Fields"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create CI Type",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateCiTypeMutation),
    },
    stats: [
      {
        key: "total",
        label: "CI Types",
        compute: (rows) => rows.length,
        icon: <Boxes className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/asset-categories",
    title: "Asset Categories",
    description: "Categories used to classify assets with depreciation rules.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: { kind: "api", useList: asQueryHook(useListAssetCategoriesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Category"),
      textCol("parent.name", "Parent"),
      textCol("depreciation", "Depreciation"),
      textCol("isActive", "Active"),
      textCol("_count.children", "Children"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Asset Category",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateAssetCategoryMutation),
    },
    stats: [
      {
        key: "total",
        label: "Categories",
        compute: (rows) => rows.length,
        icon: <Package className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/cmdb-asset-management/lifecycle-rules",
    title: "Asset Lifecycle Rules",
    description:
      "Relationship types that encode asset lifecycle and inter-CI dependencies.",
    sectionLabel: SECTION,
    rowId: "relationshipTypeId",
    source: {
      kind: "api",
      useList: asQueryHook(useListRelationshipTypesQuery),
    },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Relationship"),
      textCol("sourceTypeKey", "Source Type"),
      textCol("targetTypeKey", "Target Type"),
      textCol("isDirectional", "Directional"),
      textCol("isActive", "Active"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Relationship Type",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "sourceTypeKey", label: "Source Type Key", type: "text" },
        { key: "targetTypeKey", label: "Target Type Key", type: "text" },
      ],
      useCreate: asMutationHook(useCreateRelationshipTypeMutation),
    },
    stats: [
      {
        key: "total",
        label: "Relationships",
        compute: (rows) => rows.length,
        icon: <RefreshCw className="h-5 w-5" />,
      },
    ],
  },
];
