import api from "@shared/lib/api";

export interface Problem {
  _id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  impact?: string;
  urgency?: string;
  category?: string;
  subcategory?: string;
  assignmentGroup?: { _id: string; name: string };
  assignedTo?: { _id: string; name: string; email: string };
  rootCause?: string;
  rootCauseCategory?: string;
  workaround?: string;
  workaroundPublished?: boolean;
  permanentSolution?: string;
  knownError?: boolean;
  knownErrorId?: string;
  riskAccepted?: boolean;
  timeline?: Array<{ at: string; by: string; message: string }>;
  isActive?: boolean;
  resolvedAt?: string;
  closedAt?: string;
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProblemTask {
  _id: string;
  number: string;
  problem: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: { _id: string; name: string; email: string };
  assignmentGroup?: { _id: string; name: string };
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface KnownError {
  _id: string;
  number: string;
  problem: { _id: string; number: string; title: string };
  title: string;
  description?: string;
  rootCause?: string;
  workaround?: string;
  impact?: string;
  affectedServices?: string[];
  status: string;
  publishedAt?: string;
  createdAt: string;
}

export interface RootCauseRecord {
  _id: string;
  problem: string;
  category: string;
  description?: string;
  evidence?: string[];
  contributingFactors?: string[];
  identifiedBy?: { _id: string; name: string };
  identifiedAt: string;
  isVerified?: boolean;
}

export interface ProblemAssignmentHistory {
  _id: string;
  problem: string;
  assignmentType: string;
  fromGroup?: { _id: string; name: string };
  fromAgent?: { _id: string; name: string };
  toGroup?: { _id: string; name: string };
  toAgent?: { _id: string; name: string };
  reason?: string;
  assignedAt: string;
}

export const problemApi = {
  list: (params?: Record<string, unknown>) =>
    api.get("/core/problems", { params }),
  create: (body: Record<string, unknown>) => api.post("/core/problems", body),
  getById: (id: string) => api.get(`/core/problems/${id}`),
  update: (id: string, body: Record<string, unknown>) =>
    api.put(`/core/problems/${id}`, body),
  transition: (id: string, body: { status: string; notes?: string }) =>
    api.post(`/core/problems/${id}/transition`, body),
  assign: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/problems/${id}/assign`, body),
  addComment: (id: string, body: { message: string }) =>
    api.post(`/core/problems/${id}/comment`, body),
  getAssignmentHistory: (id: string) =>
    api.get(`/core/problems/${id}/assignment-history`),

  linkIncident: (id: string, incidentId: string) =>
    api.post(`/core/problems/${id}/incident`, { incidentId }),
  unlinkIncident: (id: string, incidentId: string) =>
    api.delete(`/core/problems/${id}/incident/${incidentId}`),
  listIncidents: (id: string) => api.get(`/core/problems/${id}/incident`),

  linkCI: (id: string, body: { ciId: string; role?: string }) =>
    api.post(`/core/problems/${id}/ci`, body),
  unlinkCI: (id: string, ciId: string) =>
    api.delete(`/core/problems/${id}/ci/${ciId}`),
  listCIs: (id: string) => api.get(`/core/problems/${id}/ci`),

  linkServiceOffering: (
    id: string,
    body: { serviceOfferingId: string; role?: string },
  ) => api.post(`/core/problems/${id}/service-offering`, body),
  linkChange: (
    id: string,
    body: { changeId: string; relationshipType?: string },
  ) => api.post(`/core/problems/${id}/change`, body),
  listChanges: (id: string) => api.get(`/core/problems/${id}/change`),
  linkKnowledge: (
    id: string,
    body: { knowledgeArticleId: string; role?: string },
  ) => api.post(`/core/problems/${id}/knowledge`, body),

  createTask: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/problems/${id}/task`, body),
  listTasks: (id: string, params?: Record<string, unknown>) =>
    api.get(`/core/problems/${id}/task`, { params }),

  publishWorkaround: (id: string) =>
    api.post(`/core/problems/${id}/publish-workaround`),
  acceptRisk: (id: string, reason?: string) =>
    api.post(`/core/problems/${id}/accept-risk`, { reason }),
  reanalyze: (id: string) => api.post(`/core/problems/${id}/reanalyze`),

  createKnownError: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/problems/${id}/known-error`, body),
  listKnownErrors: (params?: Record<string, unknown>) =>
    api.get("/core/problems/known-errors", { params }),

  createRootCauseRecord: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/problems/${id}/root-cause`, body),
  listRootCauseRecords: (id: string) =>
    api.get(`/core/problems/${id}/root-cause`),
};
