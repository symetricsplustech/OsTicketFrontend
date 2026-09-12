import api from "@shared/lib/api";

export interface Change {
  _id: string;
  number: string;
  title: string;
  description?: string;
  type: string;
  risk: string;
  riskScore?: number;
  impact?: string;
  urgency?: string;
  status: string;
  justification?: string;
  implementationPlan?: string;
  testPlan?: string;
  rollbackPlan?: string;
  validationPlan?: string;
  windowStart?: string;
  windowEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  assignmentGroup?: { _id: string; name: string };
  assignedTo?: { _id: string; name: string; email: string };
  changeManager?: { _id: string; name: string };
  closeCode?: string;
  closeNotes?: string;
  timeline?: Array<{ at: string; by: string; message: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeTask {
  _id: string;
  number: string;
  change: string;
  title: string;
  description?: string;
  status: string;
  order: number;
  assignedTo?: { _id: string; name: string };
  dueAt?: string;
  completedAt?: string;
  result?: string;
  createdAt: string;
}

export interface CABMeeting {
  _id: string;
  cab: { _id: string; name: string };
  title: string;
  scheduledAt: string;
  status: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface CABAgendaItem {
  _id: string;
  meeting: string;
  change: {
    _id: string;
    number: string;
    title: string;
    risk: string;
    status: string;
  };
  order: number;
  decision: string;
  decisionNotes?: string;
  decidedAt?: string;
}

export const changeApi = {
  list: (params?: Record<string, unknown>) =>
    api.get("/core/changes", { params }),
  create: (body: Record<string, unknown>) => api.post("/core/changes", body),
  getById: (id: string) => api.get(`/core/changes/${id}`),
  update: (id: string, body: Record<string, unknown>) =>
    api.put(`/core/changes/${id}`, body),
  transition: (id: string, body: { status: string; notes?: string }) =>
    api.post(`/core/changes/${id}/transition`, body),
  close: (id: string, body: { closeCode: string; closeNotes?: string }) =>
    api.post(`/core/changes/${id}/close`, body),
  rollback: (id: string, reason?: string) =>
    api.post(`/core/changes/${id}/rollback`, { reason }),

  linkCI: (id: string, body: { ciId: string; role?: string }) =>
    api.post(`/core/changes/${id}/ci`, body),
  unlinkCI: (id: string, ciId: string) =>
    api.delete(`/core/changes/${id}/ci/${ciId}`),
  listCIs: (id: string) => api.get(`/core/changes/${id}/ci`),
  linkService: (
    id: string,
    body: { serviceId: string; impactLevel?: string },
  ) => api.post(`/core/changes/${id}/service`, body),

  assessRisk: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/changes/${id}/risk`, body),
  detectConflicts: (id: string) =>
    api.post(`/core/changes/${id}/conflicts/detect`),
  listConflicts: (id: string) => api.get(`/core/changes/${id}/conflicts`),

  createTask: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/changes/${id}/task`, body),
  listTasks: (id: string) => api.get(`/core/changes/${id}/task`),
  createImplementationResult: (id: string, body: Record<string, unknown>) =>
    api.post(`/core/changes/${id}/result`, body),

  listModels: () => api.get("/core/changes/models"),
  listTemplates: () => api.get("/core/changes/templates"),
  listMaintenanceWindows: () => api.get("/core/changes/maintenance-windows"),
  listBlackoutWindows: () => api.get("/core/changes/blackout-windows"),
  listApprovalPolicies: () => api.get("/core/changes/approval-policies"),

  listCABs: () => api.get("/core/changes/cab"),
  createCABMeeting: (cabId: string, body: Record<string, unknown>) =>
    api.post(`/core/changes/cab/${cabId}/meeting`, body),
  listCABMeetings: (params?: Record<string, unknown>) =>
    api.get("/core/changes/cab/meetings", { params }),
  addAgendaItem: (meetingId: string, body: Record<string, unknown>) =>
    api.post(`/core/changes/cab/meetings/${meetingId}/agenda`, body),
  listAgendaItems: (meetingId: string) =>
    api.get(`/core/changes/cab/meetings/${meetingId}/agenda`),
  decideAgendaItem: (
    itemId: string,
    body: { decision: string; decisionNotes?: string },
  ) => api.put(`/core/changes/cab/meetings/agenda/${itemId}/decide`, body),
  addAttendee: (meetingId: string, userId: string) =>
    api.post(`/core/changes/cab/meetings/${meetingId}/attendee`, { userId }),
  listAttendees: (meetingId: string) =>
    api.get(`/core/changes/cab/meetings/${meetingId}/attendee`),
};
