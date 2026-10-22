import { Settings, FileText } from "lucide-react";
import { asQueryHook, asMutationHook } from "../components/resource/types";
import type {
  ResourceListConfig,
  ConfigPanelConfig,
} from "../components/resource/types";
import { textCol } from "./columns";
import {
  useGetItsmModuleQuery,
  useUpdateItsmModuleMutation,
  useListItsmPrioritiesQuery,
  useCreateItsmPriorityMutation,
  useListItsmStatusesQuery,
  useCreateItsmStatusMutation,
} from "@services/saasadmin";

const SECTION = "Global ITSM Configuration";

function modulePanel(
  path: string,
  title: string,
  description: string,
  moduleKey: string,
  moduleName: string,
): ConfigPanelConfig {
  return {
    path,
    title,
    description: `${description} (module "${moduleName}").`,
    sectionLabel: SECTION,
    fields: [
      { key: "moduleKey", label: "Module", type: "text", readOnly: true },
      { key: "name", label: "Module Name", type: "text", readOnly: true },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "isEnabled",
        label: "Enabled for tenants",
        type: "boolean",
        help: "Globally enable or disable this ITSM module.",
      },
      {
        key: "defaultSettings",
        label: "Default Settings",
        type: "textarea",
        help: "JSON default settings applied to new tenants.",
      },
    ],
    useGet: asQueryHook(() => useGetItsmModuleQuery(moduleKey)),
    useUpdate: asMutationHook(useUpdateItsmModuleMutation),
    getValues: (payload) => {
      const value = (payload &&
        typeof payload === "object" &&
        (payload as { data?: unknown }).data) as
        Record<string, unknown> | undefined;
      return {
        moduleKey: value?.moduleKey ?? moduleKey,
        name: value?.name ?? moduleName,
        description: value?.description ?? "",
        isEnabled: Boolean(value?.isEnabled),
        defaultSettings: JSON.stringify(value?.defaultSettings ?? {}, null, 2),
      };
    },
    buildBody: (values) => ({
      description: String(values.description ?? ""),
      isEnabled: Boolean(values.isEnabled),
      defaultSettings: (() => {
        try {
          return JSON.parse(String(values.defaultSettings ?? "{}"));
        } catch {
          return {};
        }
      })(),
    }),
  };
}

export const ITSM_CONFIGURATION_PANELS: ConfigPanelConfig[] = [
  modulePanel(
    "/saas-admin/itsm-configuration/incidents",
    "Incident Configuration",
    "Global incident management settings and defaults.",
    "incident",
    "Incident Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/problems",
    "Problem Configuration",
    "Global problem management settings and defaults.",
    "problem",
    "Problem Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/changes",
    "Change Configuration",
    "Global change management settings and defaults.",
    "change",
    "Change Management",
  ),
  modulePanel(
    "/saas-admin/itsm-configuration/requests",
    "Request Configuration",
    "Global service request configuration and defaults.",
    "request",
    "Service Request",
  ),
];

export const ITSM_CONFIGURATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/itsm-configuration/priority-status",
    title: "Priority & Status Rules",
    description: "Global priority definitions applied across ITSM modules.",
    sectionLabel: SECTION,
    rowId: "priorityId",
    source: { kind: "api", useList: asQueryHook(useListItsmPrioritiesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Priority"),
      textCol("rank", "Rank"),
      textCol("color", "Color"),
      textCol("isDefault", "Default"),
      textCol("settings", "Settings"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Priority",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "rank", label: "Rank", type: "number" },
        { key: "color", label: "Color", type: "text" },
      ],
      useCreate: asMutationHook(useCreateItsmPriorityMutation),
    },
    stats: [
      {
        key: "total",
        label: "Priorities",
        compute: (rows) => rows.length,
        icon: <Settings className="h-5 w-5" />,
      },
      {
        key: "default",
        label: "Default",
        compute: (rows) => rows.filter((r) => r.isDefault).length,
        color: "success",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/itsm-configuration/custom-fields",
    title: "Custom Fields",
    description:
      "Global status definitions that power per-module record fields.",
    sectionLabel: SECTION,
    rowId: "statusId",
    source: { kind: "api", useList: asQueryHook(useListItsmStatusesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Status"),
      textCol("moduleKey", "Module"),
      textCol("category", "Category"),
      textCol("color", "Color"),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.moduleKey}`,
    create: {
      title: "Create Status",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "moduleKey", label: "Module", type: "text" },
        { key: "category", label: "Category", type: "text" },
        { key: "color", label: "Color", type: "text" },
      ],
      useCreate: asMutationHook(useCreateItsmStatusMutation),
    },
    stats: [
      {
        key: "total",
        label: "Statuses",
        compute: (rows) => rows.length,
        icon: <FileText className="h-5 w-5" />,
      },
    ],
  },
];
