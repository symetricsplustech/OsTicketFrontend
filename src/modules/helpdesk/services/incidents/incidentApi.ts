import api from '@shared/lib/api';

export interface Incident {
  _id: string;
  number: string;
  title: string;
  description?: string;
  summary?: string;
  status: string;
  severity: string;
  priority: string;
  impact?: string;
  urgency?: string;
  category?: string;
  subcategory?: string;
  caller?: { _id: string; name: string; email: string };
  affectedUser?: { _id: string; name: string; email: string };
  assignmentGroup?: { _id: string; name: string };
  assignedTo?: { _id: string; name: string; email: string };
  commander?: { _id: string; name: string; email: string };
  isMajor?: boolean;
  parentIncident?: string;
  slaDue?: string;
  responseSlaDue?: string;
  resolvedAt?: string;
  closedAt?: string;
  canceledAt?: string;
  holdReason?: string;
  resolution?: string;
  resolutionCode?: string;
  rootCause?: string;
  workaround?: string;
  timeline?: Array<{ at: string; by: string; message: string }>;
  updates?: Array<{ at: string; status: string; message: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentTask {
  _id: string;
  number: string;
  incident: string;
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

export interface MajorIncident {
  _id: string;
  incident: Incident;
  status: string;
  commander?: { _id: string; name: string; email: string };
  declaredBy?: { _id: string; name: string; email: string };
  declaredAt?: string;
  majorType?: string;
  communicationPlan?: {
    internal?: string;
    external?: string;
    cadenceMinutes?: number;
    lastBroadcastAt?: string;
  };
  execSummary?: string;
  impactedServices?: string[];
  estimatedImpact?: string;
  warRoomUrl?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MajorIncidentCandidate {
  _id: string;
  incident: Incident;
  status: string;
  nominatedBy?: { _id: string; name: string; email: string };
  nominatedAt?: string;
  justification?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface PostIncidentReview {
  _id: string;
  incident: Incident;
  majorIncident?: string;
  status: string;
  title: string;
  summary?: string;
  rootCauseAnalysis?: {
    rootCause?: string;
    category?: string;
    contributingFactors?: string[];
    detectionGap?: string;
    responseGap?: string;
  };
  actionItems?: Array<{
    _id: string;
    description: string;
    owner?: { _id: string; name: string };
    dueDate?: string;
    status: string;
    completedAt?: string;
  }>;
  lessonsLearned?: string[];
  impactSummary?: {
    usersAffected?: number;
    servicesAffected?: string[];
    slaBreached?: boolean;
  };
  createdBy?: { _id: string; name: string; email: string };
  approvedBy?: { _id: string; name: string; email: string };
  publishedAt?: string;
  createdAt: string;
}

export interface IncidentAssignmentHistory {
  _id: string;
  incident: string;
  assignmentType: string;
  fromGroup?: { _id: string; name: string };
  fromAgent?: { _id: string; name: string };
  toGroup?: { _id: string; name: string };
  toAgent?: { _id: string; name: string };
  reason?: string;
  assignedBy?: { _id: string; name: string };
  assignedAt: string;
}

export interface IncidentResolution {
  _id: string;
  incident: string;
  resolutionCode: string;
  notes?: string;
  rootCause?: string;
  rootCauseCategory?: string;
  workaround?: string;
  resolvedBy?: { _id: string; name: string };
  resolvedAt: string;
  confirmedByUser?: boolean;
}

export interface IncidentRelationship {
  _id: string;
  sourceIncident: Incident;
  targetIncident: Incident;
  relationshipType: string;
  linkedBy?: { _id: string; name: string };
  linkedAt: string;
}

export interface IncidentCI {
  _id: string;
  incident: string;
  ci: { _id: string; name: string };
  role: string;
  linkedAt: string;
}

export interface MajorIncidentParticipant {
  _id: string;
  majorIncident: string;
  user: { _id: string; name: string; email: string };
  role: string;
  joinedAt: string;
  isActive: boolean;
}

export interface MajorIncidentTimelineEvent {
  _id: string;
  majorIncident: string;
  eventType: string;
  message: string;
  author?: { _id: string; name: string; email: string };
  visibility: string;
  createdAt: string;
}

export const incidentApi = {
  list: (params?: Record<string, unknown>) => api.get('/core/incidents', { params }),
  create: (body: Record<string, unknown>) => api.post('/core/incidents', body),
  getById: (id: string) => api.get(`/core/incidents/${id}`),
  update: (id: string, body: Record<string, unknown>) => api.put(`/core/incidents/${id}`, body),
  transition: (id: string, body: { status: string; notes?: string }) => api.post(`/core/incidents/${id}/transition`, body),
  assign: (id: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/assign`, body),
  addComment: (id: string, body: { message: string; type?: string }) => api.post(`/core/incidents/${id}/comment`, body),
  resolve: (id: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/resolve`, body),
  close: (id: string) => api.post(`/core/incidents/${id}/close`),
  reopen: (id: string, reason?: string) => api.post(`/core/incidents/${id}/reopen`, { reason }),
  cancel: (id: string, reason?: string) => api.post(`/core/incidents/${id}/cancel`, { reason }),
  getAssignmentHistory: (id: string) => api.get(`/core/incidents/${id}/assignment-history`),
  getDuplicateCandidates: (params: { title: string; category?: string }) => api.get('/core/incidents/duplicates', { params }),

  linkCI: (id: string, body: { ciId: string; role?: string }) => api.post(`/core/incidents/${id}/ci`, body),
  unlinkCI: (id: string, ciId: string) => api.delete(`/core/incidents/${id}/ci/${ciId}`),
  listCIs: (id: string) => api.get(`/core/incidents/${id}/ci`),
  linkServiceOffering: (id: string, body: { serviceOfferingId: string; role?: string }) => api.post(`/core/incidents/${id}/service-offering`, body),
  linkIncident: (id: string, body: { targetIncidentId: string; relationshipType: string }) => api.post(`/core/incidents/${id}/relationship`, body),
  listRelationships: (id: string) => api.get(`/core/incidents/${id}/relationship`),

  createTask: (id: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/task`, body),
  listTasks: (id: string, params?: Record<string, unknown>) => api.get(`/core/incidents/${id}/task`, { params }),

  nominateMajor: (id: string, body?: Record<string, unknown>) => api.post(`/core/incidents/${id}/major/nominate`, body || {}),
  approveMajor: (id: string) => api.post(`/core/incidents/${id}/major/approve`),
  rejectMajor: (id: string, reason?: string) => api.post(`/core/incidents/${id}/major/reject`, { reason }),
  demoteMajor: (id: string, reason?: string) => api.post(`/core/incidents/${id}/major/demote`, { reason }),
  listMajorIncidents: (params?: Record<string, unknown>) => api.get('/core/incidents/major', { params }),
  getMajorIncident: (id: string) => api.get(`/core/incidents/${id}/major`),
  listMajorCandidates: (params?: Record<string, unknown>) => api.get('/core/incidents/major/candidates', { params }),
  updateMajorCommPlan: (id: string, body: Record<string, unknown>) => api.put(`/core/incidents/${id}/major/comm-plan`, body),
  updateMajorExecSummary: (id: string, execSummary: string) => api.put(`/core/incidents/${id}/major/exec-summary`, { execSummary }),
  addMajorParticipant: (id: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/major/participant`, body),
  removeMajorParticipant: (id: string, userId: string) => api.delete(`/core/incidents/${id}/major/participant/${userId}`),
  listMajorParticipants: (id: string) => api.get(`/core/incidents/${id}/major/participant`),
  addMajorTimelineEvent: (id: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/major/timeline`, body),
  listMajorTimelineEvents: (id: string, params?: Record<string, unknown>) => api.get(`/core/incidents/${id}/major/timeline`, { params }),

  createPIR: (body: Record<string, unknown>) => api.post('/core/incidents', body),
  listPIRs: (params?: Record<string, unknown>) => api.get('/core/incidents/pir', { params }),
  getPIR: (id: string, pirId: string) => api.get(`/core/incidents/${id}/pir/${pirId}`),
  updatePIR: (id: string, pirId: string, body: Record<string, unknown>) => api.put(`/core/incidents/${id}/pir/${pirId}`, body),
  submitPIRForReview: (id: string, pirId: string) => api.post(`/core/incidents/${id}/pir/${pirId}/submit`),
  approvePIR: (id: string, pirId: string) => api.post(`/core/incidents/${id}/pir/${pirId}/approve`),
  publishPIR: (id: string, pirId: string) => api.post(`/core/incidents/${id}/pir/${pirId}/publish`),
  addPIRActionItem: (id: string, pirId: string, body: Record<string, unknown>) => api.post(`/core/incidents/${id}/pir/${pirId}/action-item`, body),
  updatePIRActionItem: (id: string, pirId: string, actionItemId: string, body: Record<string, unknown>) => api.put(`/core/incidents/${id}/pir/${pirId}/action-item/${actionItemId}`, body),
  deletePIRActionItem: (id: string, pirId: string, actionItemId: string) => api.delete(`/core/incidents/${id}/pir/${pirId}/action-item/${actionItemId}`),
};
