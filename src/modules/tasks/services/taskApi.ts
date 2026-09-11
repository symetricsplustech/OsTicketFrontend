import api from '@shared/lib/api';
import type { Task, TaskListResponse, TaskActivity, TaskWatcher, TaskRelationship, TaskStats } from '@shared/types/task';

const BASE = '/core/tasks';

export const taskApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<TaskListResponse>(BASE, { params }),

  getById: (id: string) =>
    api.get<Task & { watchers: TaskWatcher[]; relationships: { outgoing: TaskRelationship[]; incoming: TaskRelationship[] } }>(`${BASE}/${id}`),

  create: (data: Partial<Task>) =>
    api.post<Task>(BASE, data),

  update: (id: string, data: Partial<Task>) =>
    api.put<Task>(`${BASE}/${id}`, data),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),

  restore: (id: string) =>
    api.post<Task>(`${BASE}/${id}/restore`),

  transition: (id: string, state: string, comment?: string) =>
    api.post<Task>(`${BASE}/${id}/transition`, { state, comment }),

  getAllowedTransitions: (id: string) =>
    api.get<{ from: string; allowed: string[] }>(`${BASE}/${id}/transitions`),

  addComment: (id: string, content: string, isPublic = true) =>
    api.post<TaskActivity>(`${BASE}/${id}/comment`, { content, isPublic }),

  getStats: () =>
    api.get<TaskStats>(`${BASE}/stats`),

  getWatchers: (id: string) =>
    api.get<TaskWatcher[]>(`${BASE}/${id}/watchers`),

  addWatcher: (id: string, userId: string) =>
    api.post<TaskWatcher>(`${BASE}/${id}/watchers`, { userId }),

  removeWatcher: (id: string, userId: string) =>
    api.delete(`${BASE}/${id}/watchers/${userId}`),

  getRelationships: (id: string) =>
    api.get<{ outgoing: TaskRelationship[]; incoming: TaskRelationship[] }>(`${BASE}/${id}/relationships`),

  addRelationship: (id: string, targetTaskId: string, relationshipType: string) =>
    api.post<TaskRelationship>(`${BASE}/${id}/relationships`, { targetTaskId, relationshipType }),

  removeRelationship: (id: string, relId: string) =>
    api.delete(`${BASE}/${id}/relationships/${relId}`),

  // Attachments
  uploadAttachment: (taskId: string, file: File, isPublic = true, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPublic', String(isPublic));
    formData.append('description', description);
    return api.post(`/core/attachments/${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listAttachments: (taskId: string) =>
    api.get(`/core/attachments/${taskId}`),

  downloadAttachment: (id: string) =>
    api.get(`/core/attachments/${id}/download`, { responseType: 'blob' }),

  removeAttachment: (id: string) =>
    api.delete(`/core/attachments/${id}`),
};

// Approvals API
export const approvalApi = {
  listForTask: (taskId: string) =>
    api.get(`/core/approvals/task/${taskId}`),

  create: (data: Record<string, unknown>) =>
    api.post('/core/approvals', data),

  decide: (id: string, decision: string, note = '') =>
    api.post(`/core/approvals/${id}/decide`, { decision, note }),

  cancel: (id: string) =>
    api.post(`/core/approvals/${id}/cancel`),

  delegate: (id: string, delegatedTo: string, note = '') =>
    api.post(`/core/approvals/${id}/delegate`, { delegatedTo, note }),

  pending: () =>
    api.get('/core/approvals/pending'),

  stats: () =>
    api.get('/core/approvals/stats'),
};

// Audit API
export const auditApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/core/audit', { params }),
};

// SLA API (uses task service)
export const slaApi = {
  listForTask: (taskId: string) =>
    api.get(`/core/tasks/${taskId}`),
};
