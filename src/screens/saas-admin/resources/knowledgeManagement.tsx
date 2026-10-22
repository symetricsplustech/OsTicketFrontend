import { Settings, Boxes, ShieldCheck, UserRound } from "lucide-react";
import {
  asQueryHook,
  asMutationHook,
  VARIANT_FROM_STATUS,
} from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListKnowledgePoliciesQuery,
  useCreateKnowledgePolicyMutation,
  useListKnowledgeCategoriesQuery,
  useCreateKnowledgeCategoryMutation,
  useListKnowledgeReviewRulesQuery,
  useCreateKnowledgeReviewRuleMutation,
  useListKnowledgeTemplatesQuery,
  useCreateKnowledgeTemplateMutation,
} from "@services/saasadmin";

const SECTION = "Knowledge Management";

export const KNOWLEDGE_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/knowledge-management/settings",
    title: "Knowledge Base Settings",
    description:
      "Knowledge base policies for authoring, publishing and review.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgePoliciesQuery),
    },
    columns: [
      textCol("name", "Policy"),
      textCol("description", "Description"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Knowledge Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateKnowledgePolicyMutation),
    },
    stats: [
      {
        key: "total",
        label: "Policies",
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
    path: "/saas-admin/knowledge-management/categories",
    title: "Article Categories",
    description: "Hierarchy of knowledge article categories.",
    sectionLabel: SECTION,
    rowId: "categoryId",
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeCategoriesQuery),
    },
    columns: [
      textCol("name", "Category"),
      textCol("description", "Description"),
      textCol("parent.name", "Parent"),
      textCol("sortOrder", "Sort Order"),
      textCol("isActive", "Active"),
      textCol("_count.templates", "Templates"),
    ],
    searchable: (r) => `${r.name} ${r.description}`,
    create: {
      title: "Create Category",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
      useCreate: asMutationHook(useCreateKnowledgeCategoryMutation),
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
    path: "/saas-admin/knowledge-management/publishing-rules",
    title: "Publishing Rules",
    description: "Review scheduling rules that govern content publishing.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeReviewRulesQuery),
    },
    columns: [
      textCol("name", "Rule"),
      textCol("category.name", "Category"),
      textCol("intervalDays", "Review Interval (days)"),
      textCol("notifyBeforeDays", "Notify Before"),
      textCol("action", "Action"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name}`,
    create: {
      title: "Create Review Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        {
          key: "intervalDays",
          label: "Review Interval (days)",
          type: "number",
        },
        {
          key: "notifyBeforeDays",
          label: "Notify Before (days)",
          type: "number",
        },
      ],
      useCreate: asMutationHook(useCreateKnowledgeReviewRuleMutation),
    },
    stats: [
      {
        key: "total",
        label: "Rules",
        compute: (rows) => rows.length,
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    path: "/saas-admin/knowledge-management/moderation",
    title: "Content Moderation",
    description:
      "Article template status and moderation state across the knowledge base.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeTemplatesQuery),
    },
    columns: [
      {
        key: "key",
        header: "Key",
        render: (r) => (
          <span className="font-mono text-xs">{String(r.key ?? "—")}</span>
        ),
      },
      textCol("name", "Title"),
      textCol("category.name", "Category"),
      statusCol("status", "State", (r) =>
        VARIANT_FROM_STATUS(String(r.status)),
      ),
      textCol("fields", "Fields"),
    ],
    searchable: (r) => `${r.name} ${r.key}`,
    create: {
      title: "Create Article Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateKnowledgeTemplateMutation),
    },
    stats: [
      {
        key: "total",
        label: "Templates",
        compute: (rows) => rows.length,
        icon: <UserRound className="h-5 w-5" />,
      },
      {
        key: "enabled",
        label: "Published",
        compute: (rows) => rows.filter((r) => r.status === "ENABLED").length,
        color: "success",
        icon: <UserRound className="h-5 w-5" />,
      },
      {
        key: "draft",
        label: "Draft",
        compute: (rows) => rows.filter((r) => r.status === "DRAFT").length,
        color: "warning",
        icon: <UserRound className="h-5 w-5" />,
      },
    ],
  },
];
