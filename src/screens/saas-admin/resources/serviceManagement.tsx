import {
  Layers,
  Boxes,
  FileText,
  Globe,
  Rocket,
  Power,
  PowerOff,
} from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListServicesQuery,
  useCreateServiceMutation,
  useEnableServiceMutation,
  useDisableServiceMutation,
  useListServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useListServiceTemplatesQuery,
  useCreateServiceTemplateMutation,
  usePublishServiceTemplateMutation,
  useListSlaCalendarsQuery,
} from "@services/saasadmin";

const SECTION = "Service Management";

export const SERVICE_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/service-management/catalog",
    title: "Service Catalog",
    description: "Global service catalog offered across tenants.",
    sectionLabel: SECTION,
    rowId: "serviceId",
    source: { kind: "api", useList: asQueryHook(useListServicesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("category.name", "Category"),
      textCol("owner", "Owner"),
      textCol("_count.templates", "Templates"),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.owner}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DISABLED", label: "Disabled" },
          { value: "DRAFT", label: "Draft" },
        ],
        placeholder: "All statuses",
      },
    ],
    stats: [
      {
        key: "total",
        label: "Total Services",
        compute: (rows) => rows.length,
        icon: <Layers className="h-5 w-5" />,
      },
      {
        key: "enabled",
        label: "Enabled",
        compute: (rows) => rows.filter((r) => r.status === "ENABLED").length,
        color: "success",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        key: "draft",
        label: "Draft",
        compute: (rows) => rows.filter((r) => r.status === "DRAFT").length,
        color: "warning",
        icon: <Layers className="h-5 w-5" />,
      },
    ],
    create: {
      title: "Create Service",
      description: "Add a new catalog service.",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "owner", label: "Owner", type: "text" },
      ],
      useCreate: asMutationHook(useCreateServiceMutation),
    },
    actions: [
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableServiceMutation),
        buildArg: (row) => String(row.serviceId ?? row.id),
        confirm: (row) =>
          `Enable service "${row.name}"? It becomes available in the catalog.`,
        successMessage: "Service enabled.",
        show: (row) => String(row.status ?? "").toUpperCase() !== "ENABLED",
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableServiceMutation),
        buildArg: (row) => String(row.serviceId ?? row.id),
        confirm: (row) =>
          `Disable service "${row.name}"? It will no longer be offered.`,
        successMessage: "Service disabled.",
        show: (row) => String(row.status ?? "").toUpperCase() === "ENABLED",
      },
    ],
  },
  {
    path: "/saas-admin/service-management/categories",
    title: "Service Categories",
    description: "Manage the global service category hierarchy.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: {
      kind: "api",
      useList: asQueryHook(useListServiceCategoriesQuery),
    },
    columns: [
      textCol("name", "Name"),
      textCol("description", "Description"),
      textCol("parent.name", "Parent Category"),
      textCol("sortOrder", "Sort Order"),
      textCol("_count.children", "Child Categories"),
      textCol("_count.services", "Services"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Category",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
      useCreate: asMutationHook(useCreateServiceCategoryMutation),
    },
    stats: [
      {
        key: "total",
        label: "Categories",
        compute: (rows) => rows.length,
        icon: <Boxes className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/service-management/templates",
    title: "Service Templates",
    description: "Reusable service templates with versioned definitions.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: { kind: "api", useList: asQueryHook(useListServiceTemplatesQuery) },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Name"),
      statusCol("status", "Status", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("service.name", "Service"),
      textCol("currentVersion", "Version"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "PUBLISHED", label: "Published" },
          { value: "DRAFT", label: "Draft" },
          { value: "RETIRED", label: "Retired" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateServiceTemplateMutation),
    },
    actions: [
      {
        label: "Publish",
        icon: <Rocket className="h-3.5 w-3.5" />,
        useAction: asMutationHook(usePublishServiceTemplateMutation),
        buildArg: (row) => String(row.templateId ?? row.id),
        confirm: (row) =>
          `Publish template "${row.name}"? The latest version becomes available for provisioning.`,
        successMessage: "Template published.",
        show: (row) => String(row.status ?? "").toUpperCase() !== "PUBLISHED",
      },
    ],
    stats: [
      {
        key: "total",
        label: "Templates",
        compute: (rows) => rows.length,
        icon: <FileText className="h-5 w-5" />,
      },
      {
        key: "published",
        label: "Published",
        compute: (rows) => rows.filter((r) => r.status === "PUBLISHED").length,
        color: "success",
        icon: <FileText className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/service-management/availability",
    title: "Service Availability",
    description:
      "Working hours, calendars and holidays that define service availability.",
    sectionLabel: SECTION,
    rowId: "calendarId",
    source: { kind: "api", useList: asQueryHook(useListSlaCalendarsQuery) },
    columns: [
      textCol("name", "Calendar"),
      textCol("timezone", "Timezone"),
      textCol("workingHours", "Working Hours"),
      textCol("holidays", "Holidays"),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.timezone}`,
    stats: [
      {
        key: "total",
        label: "Calendars",
        compute: (rows) => rows.length,
        icon: <Globe className="h-5 w-5" />,
      },
      {
        key: "default",
        label: "Default",
        compute: (rows) => rows.filter((r) => r.isDefault).length,
        color: "success",
        icon: <Globe className="h-5 w-5" />,
      },
    ],
  },
];
