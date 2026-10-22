import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export interface CatalogCategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  icon: string | null;
  status: string | null;
  createdAt: string;
  _count?: { items: number; children: number };
}

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  shortDescription: string | null;
  description: string | null;
  itemType: string;
  price: number | null;
  currency: string | null;
  fulfillmentTeamId: string | null;
  approvalRequired: boolean;
  formSchema: Record<string, unknown> | null;
  tags: string[];
  status: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
}

export interface CatalogItemVersion {
  id: string;
  itemId: string;
  version: number;
  snapshot: Record<string, unknown> | null;
  publishedAt: string;
  publishedById: string | null;
}

export const CATALOG_PATH = "/itsm/catalog";

export const catalogApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<CatalogCategory, "CatalogCategory">(build, {
      path: `${CATALOG_PATH}/categories`,
      tag: "CatalogCategory",
    }),
    ...crudEndpoints<CatalogItem, "CatalogItem">(build, {
      path: `${CATALOG_PATH}/items`,
      tag: "CatalogItem",
    }),
    publishCatalogItem: transitionEndpoint<CatalogItem, "CatalogItem">(
      build,
      `${CATALOG_PATH}/items`,
      "CatalogItem",
      "/publish",
    ),
    retireCatalogItem: transitionEndpoint<CatalogItem, "CatalogItem">(
      build,
      `${CATALOG_PATH}/items`,
      "CatalogItem",
      "/retire",
    ),
    listCatalogItemVersions: build.query<
      ListResponse<CatalogItemVersion> & { meta?: PaginationMeta },
      { itemId: string } & ListArgs
    >({
      query: ({ itemId, ...args }) => ({
        url: `${resourceUrl(`${CATALOG_PATH}/items`, itemId)}/versions${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "CatalogItemVersion", id: args.itemId },
      ],
    }),
  }),
});

export const {
  useListCatalogCategoryQuery,
  useGetCatalogCategoryQuery,
  useCreateCatalogCategoryMutation,
  useUpdateCatalogCategoryMutation,
  useDeleteCatalogCategoryMutation,
  useListCatalogItemQuery,
  useGetCatalogItemQuery,
  useCreateCatalogItemMutation,
  useUpdateCatalogItemMutation,
  useDeleteCatalogItemMutation,
  usePublishCatalogItemMutation,
  useRetireCatalogItemMutation,
  useListCatalogItemVersionsQuery,
} = catalogApi;

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  status: string | null;
  createdAt: string;
  _count?: { articles: number };
}

export interface KnowledgeArticle {
  id: string;
  number: string;
  title: string;
  summary: string | null;
  body: string | null;
  categoryId: string | null;
  status: string;
  visibility: string;
  tags: string[];
  authorId: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  author?: { id: string; firstName: string; lastName: string } | null;
}

export interface KnowledgeComment {
  id: string;
  body: string;
  isInternal: boolean;
  authorId: string | null;
  createdAt: string;
}

export interface KnowledgeSettings {
  defaultVisibility: string;
  requireReviewBeforePublish: boolean;
  allowInternalComments: boolean;
  enableFeedback: boolean;
  enableVersioning: boolean;
  reviewIntervalDays: number;
}

export const KNOWLEDGE_PATH = "/itsm/knowledge";

export const knowledgeApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<KnowledgeCategory, "KnowledgeCategory">(build, {
      path: `${KNOWLEDGE_PATH}/categories`,
      tag: "KnowledgeCategory",
    }),
    ...crudEndpoints<KnowledgeArticle, "KnowledgeArticle">(build, {
      path: `${KNOWLEDGE_PATH}/articles`,
      tag: "KnowledgeArticle",
    }),
    submitKnowledgeArticle: transitionEndpoint<
      KnowledgeArticle,
      "KnowledgeArticle"
    >(build, `${KNOWLEDGE_PATH}/articles`, "KnowledgeArticle", "/submit"),
    publishKnowledgeArticle: transitionEndpoint<
      KnowledgeArticle,
      "KnowledgeArticle"
    >(build, `${KNOWLEDGE_PATH}/articles`, "KnowledgeArticle", "/publish"),
    archiveKnowledgeArticle: transitionEndpoint<
      KnowledgeArticle,
      "KnowledgeArticle"
    >(build, `${KNOWLEDGE_PATH}/articles`, "KnowledgeArticle", "/archive"),
    listKnowledgeArticleComments: build.query<
      ListResponse<KnowledgeComment>,
      { articleId: string } & ListArgs
    >({
      query: ({ articleId, ...args }) => ({
        url: `${resourceUrl(`${KNOWLEDGE_PATH}/articles`, articleId)}/comments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "KnowledgeComment", id: args.articleId },
      ],
    }),
    createKnowledgeArticleComment: build.mutation<
      ApiSuccess<KnowledgeComment>,
      { articleId: string; body: { body: string; isInternal?: boolean } }
    >({
      query: ({ articleId, body }) => ({
        url: `${resourceUrl(`${KNOWLEDGE_PATH}/articles`, articleId)}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["KnowledgeComment"],
    }),
    getKnowledgeSettings: build.query<ApiSuccess<KnowledgeSettings>, void>({
      query: () => ({ url: `${KNOWLEDGE_PATH}/settings` }),
      providesTags: ["KnowledgeSettings"],
    }),
    updateKnowledgeSettings: build.mutation<
      ApiSuccess<KnowledgeSettings>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: `${KNOWLEDGE_PATH}/settings`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["KnowledgeSettings"],
    }),
  }),
});

export const {
  useListKnowledgeCategoryQuery,
  useGetKnowledgeCategoryQuery,
  useCreateKnowledgeCategoryMutation,
  useUpdateKnowledgeCategoryMutation,
  useDeleteKnowledgeCategoryMutation,
  useListKnowledgeArticleQuery,
  useGetKnowledgeArticleQuery,
  useCreateKnowledgeArticleMutation,
  useUpdateKnowledgeArticleMutation,
  useDeleteKnowledgeArticleMutation,
  useSubmitKnowledgeArticleMutation,
  usePublishKnowledgeArticleMutation,
  useArchiveKnowledgeArticleMutation,
  useListKnowledgeArticleCommentsQuery,
  useCreateKnowledgeArticleCommentMutation,
  useGetKnowledgeSettingsQuery,
  useUpdateKnowledgeSettingsMutation,
} = knowledgeApi;
