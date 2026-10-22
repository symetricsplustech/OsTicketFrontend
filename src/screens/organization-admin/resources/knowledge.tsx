import type { ResourceListConfig, ConfigPanelConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListKnowledgeCategoryQuery,
  useListKnowledgeArticleQuery,
  useCreateKnowledgeCategoryMutation,
  useCreateKnowledgeArticleMutation,
  useGetKnowledgeSettingsQuery,
  useUpdateKnowledgeSettingsMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const CAT_PATH = "/organization/knowledge-management/knowledge-categories";
const ARTICLES_PATH = "/organization/knowledge-management/knowledge-articles";

const catColumns: Column<any>[] = [
  { key: "name", header: "Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "knowledgeBase", header: "Knowledge Base", render: (row: any) => row.knowledgeBase?.name || "-" },
  statusColumn<any>("status"),
];

const articleColumns: Column<any>[] = [
  { key: "title", header: "Article", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  { key: "author", header: "Author", render: (row: any) => row.author?.displayName || "-" },
  { key: "views", header: "Views", render: (row: any) => row.viewCount ?? 0 },
  statusColumn<any>("status"),
];

export const knowledgeConfigs: ResourceListConfig[] = [
  {
    path: CAT_PATH,
    title: "Knowledge Categories",
    description: "Article categorization",
    sectionLabel: "Service Catalog & Knowledge",
    rowId: "id",
    columns: catColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${CAT_PATH}/${row.id}`,
    create: {
      title: "Create Category",
      description: "Create a new knowledge category.",
      fields: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "knowledgeBaseId", label: "Knowledge base ID", type: "text" },
      ],
      useCreate: asMutationHook(useCreateKnowledgeCategoryMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, knowledgeBaseId: values.knowledgeBaseId }),
      successMessage: "Category created",
    },
  },
  {
    path: ARTICLES_PATH,
    title: "Knowledge Articles",
    description: "Published knowledge base articles",
    sectionLabel: "Service Catalog & Knowledge",
    rowId: "id",
    columns: articleColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeArticleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.title} ${row.category?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Published", value: "PUBLISHED" },
          { label: "In Review", value: "IN_REVIEW" },
          { label: "Draft", value: "DRAFT" },
          { label: "Expired", value: "EXPIRED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${ARTICLES_PATH}/${row.id}`,
    create: {
      title: "Create Article",
      description: "Create a new knowledge article.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "body", label: "Body", type: "textarea", required: true },
        { key: "categoryId", label: "Category ID", type: "text", required: true },
        { key: "knowledgeBaseId", label: "Knowledge base ID", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateKnowledgeArticleMutation),
      buildBody: (values: Record<string, unknown>) => ({ title: values.title, body: values.body, categoryId: values.categoryId, knowledgeBaseId: values.knowledgeBaseId }),
      successMessage: "Article created",
    },
  },
];
export const knowledgePanelConfigs: ConfigPanelConfig[] = [
  {
    path: "/organization/knowledge-management/publishing-rules",
    title: "Publishing Rules",
    description: "Review, publishing and feedback rules for knowledge articles",
    sectionLabel: "Knowledge Management",
    fields: [
      {
        key: "defaultVisibility",
        label: "Default Visibility",
        type: "select",
        options: [
          { label: "Internal", value: "INTERNAL" },
          { label: "Portal", value: "PORTAL" },
        ],
      },
      { key: "requireReviewBeforePublish", label: "Require Review Before Publish", type: "boolean" },
      { key: "allowInternalComments", label: "Allow Internal Comments", type: "boolean" },
      { key: "enableFeedback", label: "Enable Feedback and Ratings", type: "boolean" },
      { key: "enableVersioning", label: "Enable Versioning", type: "boolean" },
      { key: "reviewIntervalDays", label: "Review Interval (days)", type: "number" },
    ],
    useGet: asQueryHook(useGetKnowledgeSettingsQuery),
    useUpdate: asMutationHook(useUpdateKnowledgeSettingsMutation),
    getValues: (payload: any) =>
      payload && typeof payload === "object" ? payload : {},
    buildBody: (values: Record<string, unknown>) => values,
    saveLabel: "Save Publishing Rules",
    savedMessage: "Publishing rules saved",
  },
];
