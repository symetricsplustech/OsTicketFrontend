import api from "@shared/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────

export interface KnowledgeBase {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  visibility: "public" | "customers" | "employees" | "agents";
  isActive: boolean;
  sortOrder: number;
  articleCount: number;
  totalViews: number;
  allowComments: boolean;
  allowRatings: boolean;
  requireApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqCategory {
  _id: string;
  name: string;
  company: string;
  description: string;
  isPublic: boolean;
  sortOrder: number;
}

export interface KnowledgeArticle {
  _id: string;
  company: string;
  number: string;
  category: FaqCategory;
  knowledgeBaseId: KnowledgeBase;
  question: string;
  answer: string;
  shortSummary: string;
  keywords: string[];
  lifecycle:
    "draft" | "review" | "approved" | "published" | "expired" | "archived";
  visibility:
    "public" | "customers" | "employees" | "agents" | "department" | "team";
  internalOnly: boolean;
  isPublished: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  version: number;
  maxVersion: number;
  averageRating: number;
  ratingCount: number;
  commentCount: number;
  feedbackCount: number;
  relatedArticles: string[];
  linkedIncidents: string[];
  linkedProblems: string[];
  linkedChanges: string[];
  publishedAt: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeVersion {
  _id: string;
  articleId: string;
  version: number;
  question: string;
  answer: string;
  keywords: string[];
  lifecycle: string;
  changeSummary: string;
  changeType: "create" | "edit" | "publish" | "retire" | "restore";
  createdBy: string;
  createdAt: string;
}

export interface KnowledgeFeedback {
  _id: string;
  articleId: string;
  userId: { _id: string; name: string; email: string };
  type:
    | "helpful"
    | "not_helpful"
    | "outdated"
    | "incorrect"
    | "incomplete"
    | "unclear"
    | "suggestion";
  rating: number;
  comment: string;
  isPublic: boolean;
  source: string;
  response: string;
  responseAction: string;
  createdAt: string;
}

export interface KnowledgeRating {
  averageRating: number;
  ratingCount: number;
  distribution: number[];
}

export interface KnowledgeComment {
  _id: string;
  articleId: string;
  userId: { _id: string; name: string; email: string };
  parentId: string;
  content: string;
  isInternal: boolean;
  isResolved: boolean;
  status: "visible" | "hidden" | "flagged";
  reactions: Array<{ userId: string; type: string; createdAt: string }>;
  createdAt: string;
}

export interface KnowledgeApproval {
  _id: string;
  articleId: string;
  approver: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decidedBy: string;
  decidedAt: string;
  comment: string;
  requestedBy: string;
  requestedAt: string;
  createdAt: string;
}

export interface KBDashboard {
  total: number;
  published: number;
  draft: number;
  review: number;
  expired: number;
  archived: number;
  topViewed: KnowledgeArticle[];
  topRated: KnowledgeArticle[];
  recentFeedback: KnowledgeFeedback[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API ────────────────────────────────────────────────────────────────

export const knowledgeApi = {
  // Knowledge Bases
  listBases: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: KnowledgeBase[] }>(
      "/core/knowledge/bases",
      { params },
    ),
  getBase: (id: string) =>
    api.get<{ success: boolean; data: KnowledgeBase }>(
      `/core/knowledge/bases/${id}`,
    ),
  createBase: (data: Partial<KnowledgeBase>) =>
    api.post<{ success: boolean; data: KnowledgeBase }>(
      "/core/knowledge/bases",
      data,
    ),
  updateBase: (id: string, data: Partial<KnowledgeBase>) =>
    api.put<{ success: boolean; data: KnowledgeBase }>(
      `/core/knowledge/bases/${id}`,
      data,
    ),
  deleteBase: (id: string) =>
    api.delete<{ success: boolean }>(`/core/knowledge/bases/${id}`),

  // Categories
  listCategories: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: FaqCategory[] }>(
      "/core/knowledge/categories",
      { params },
    ),
  getCategory: (id: string) =>
    api.get<{ success: boolean; data: FaqCategory }>(
      `/core/knowledge/categories/${id}`,
    ),
  createCategory: (data: Partial<FaqCategory>) =>
    api.post<{ success: boolean; data: FaqCategory }>(
      "/core/knowledge/categories",
      data,
    ),
  updateCategory: (id: string, data: Partial<FaqCategory>) =>
    api.put<{ success: boolean; data: FaqCategory }>(
      `/core/knowledge/categories/${id}`,
      data,
    ),
  deleteCategory: (id: string) =>
    api.delete<{ success: boolean }>(`/core/knowledge/categories/${id}`),

  // Articles
  listArticles: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: PaginatedResponse<KnowledgeArticle> }>(
      "/core/knowledge/articles",
      { params },
    ),
  getArticle: (id: string) =>
    api.get<{ success: boolean; data: KnowledgeArticle }>(
      `/core/knowledge/articles/${id}`,
    ),
  createArticle: (data: Partial<KnowledgeArticle>) =>
    api.post<{ success: boolean; data: KnowledgeArticle }>(
      "/core/knowledge/articles",
      data,
    ),
  updateArticle: (
    id: string,
    data: Partial<KnowledgeArticle> & { changeSummary?: string },
  ) =>
    api.put<{ success: boolean; data: KnowledgeArticle }>(
      `/core/knowledge/articles/${id}`,
      data,
    ),
  deleteArticle: (id: string) =>
    api.delete<{ success: boolean }>(`/core/knowledge/articles/${id}`),
  transitionArticle: (
    id: string,
    data: { lifecycle: string; reason?: string },
  ) =>
    api.post<{ success: boolean; data: KnowledgeArticle }>(
      `/core/knowledge/articles/${id}/transition`,
      data,
    ),

  // Versions
  listVersions: (articleId: string) =>
    api.get<{ success: boolean; data: KnowledgeVersion[] }>(
      `/core/knowledge/articles/${articleId}/versions`,
    ),
  getVersion: (id: string) =>
    api.get<{ success: boolean; data: KnowledgeVersion }>(
      `/core/knowledge/versions/${id}`,
    ),
  restoreVersion: (articleId: string, versionId: string) =>
    api.post<{ success: boolean; data: KnowledgeArticle }>(
      `/core/knowledge/articles/${articleId}/versions/${versionId}/restore`,
    ),

  // Feedback
  listFeedback: (articleId: string, params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: KnowledgeFeedback[] }>(
      `/core/knowledge/articles/${articleId}/feedback`,
      { params },
    ),
  createFeedback: (articleId: string, data: Partial<KnowledgeFeedback>) =>
    api.post<{ success: boolean; data: KnowledgeFeedback }>(
      `/core/knowledge/articles/${articleId}/feedback`,
      data,
    ),
  respondToFeedback: (
    id: string,
    data: { response: string; responseAction: string },
  ) =>
    api.post<{ success: boolean; data: KnowledgeFeedback }>(
      `/core/knowledge/feedback/${id}/respond`,
      data,
    ),

  // Ratings
  getRatings: (articleId: string) =>
    api.get<{ success: boolean; data: KnowledgeRating }>(
      `/core/knowledge/articles/${articleId}/ratings`,
    ),
  rateArticle: (articleId: string, rating: number) =>
    api.post<{ success: boolean; data: KnowledgeRating }>(
      `/core/knowledge/articles/${articleId}/rate`,
      { rating },
    ),

  // Comments
  listComments: (articleId: string) =>
    api.get<{ success: boolean; data: KnowledgeComment[] }>(
      `/core/knowledge/articles/${articleId}/comments`,
    ),
  createComment: (
    articleId: string,
    data: { content: string; isInternal?: boolean },
  ) =>
    api.post<{ success: boolean; data: KnowledgeComment }>(
      `/core/knowledge/articles/${articleId}/comments`,
      data,
    ),
  listReplies: (commentId: string) =>
    api.get<{ success: boolean; data: KnowledgeComment[] }>(
      `/core/knowledge/comments/${commentId}/replies`,
    ),
  updateComment: (id: string, data: { content: string }) =>
    api.put<{ success: boolean; data: KnowledgeComment }>(
      `/core/knowledge/comments/${id}`,
      data,
    ),
  deleteComment: (id: string) =>
    api.delete<{ success: boolean }>(`/core/knowledge/comments/${id}`),
  moderateComment: (id: string, data: { status: string; reason?: string }) =>
    api.post<{ success: boolean; data: KnowledgeComment }>(
      `/core/knowledge/comments/${id}/moderate`,
      data,
    ),
  reactToComment: (id: string, type: string) =>
    api.post<{ success: boolean; data: KnowledgeComment }>(
      `/core/knowledge/comments/${id}/react`,
      { type },
    ),

  // Approvals
  listApprovals: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: KnowledgeApproval[] }>(
      "/core/knowledge/approvals",
      { params },
    ),
  createApproval: (
    articleId: string,
    data: { approver: string; reason?: string },
  ) =>
    api.post<{ success: boolean; data: KnowledgeApproval }>(
      `/core/knowledge/articles/${articleId}/approvals`,
      data,
    ),
  decideApproval: (
    id: string,
    data: { decision: "approved" | "rejected"; comment?: string },
  ) =>
    api.post<{ success: boolean; data: KnowledgeApproval }>(
      `/core/knowledge/approvals/${id}/decide`,
      data,
    ),

  // Search & Metrics
  search: (q: string) =>
    api.get<{ success: boolean; data: KnowledgeArticle[] }>(
      "/core/knowledge/search",
      { params: { q } },
    ),
  getMetrics: (articleId: string) =>
    api.get<{ success: boolean; data: Record<string, number> }>(
      `/core/knowledge/articles/${articleId}/metrics`,
    ),
  getDashboard: () =>
    api.get<{ success: boolean; data: KBDashboard }>(
      "/core/knowledge/dashboard",
    ),
};

export default knowledgeApi;
