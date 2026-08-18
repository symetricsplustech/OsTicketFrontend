import { api } from './index.js';

export const adminEn = {
  workflows: () => api.get('/enterprise/workflows').then((r) => r.data.items || []),
  createWorkflow: (body) => api.post('/enterprise/workflows', body).then((r) => r.data),
  updateWorkflow: (id, body) => api.put(`/enterprise/workflows/${id}`, body).then((r) => r.data),
  deleteWorkflow: (id) => api.delete(`/enterprise/workflows/${id}`).then((r) => r.data),
  testWorkflow: (id, body) => api.post(`/enterprise/workflows/${id}/test`, body).then((r) => r.data),

  skills: () => api.get('/enterprise/skills').then((r) => r.data.items || []),
  createSkill: (body) => api.post('/enterprise/skills', body).then((r) => r.data),
  updateSkill: (id, body) => api.put(`/enterprise/skills/${id}`, body).then((r) => r.data),
  deleteSkill: (id) => api.delete(`/enterprise/skills/${id}`).then((r) => r.data),

  agents: () => api.get('/admin/agents').then((r) => (r.data.agents || r.data.items || [])),
  assignSkills: (agentId, skillIds) => api.put(`/admin/agents/${agentId}`, { skills: skillIds }).then((r) => r.data),
  orgs: () => api.get('/admin/orgs').then((r) => (r.data.agents || r.data.items || [])),

  contracts: () => api.get('/enterprise/contracts').then((r) => r.data.items || []),
  createContract: (body) => api.post('/enterprise/contracts', body).then((r) => r.data),
  updateContract: (id, body) => api.put(`/enterprise/contracts/${id}`, body).then((r) => r.data),
  deleteContract: (id) => api.delete(`/enterprise/contracts/${id}`).then((r) => r.data),
  entitlements: () => api.get('/enterprise/entitlements').then((r) => r.data.items || []),
  createEntitlement: (body) => api.post('/enterprise/entitlements', body).then((r) => r.data),
  updateEntitlement: (id, body) => api.put(`/enterprise/entitlements/${id}`, body).then((r) => r.data),
  deleteEntitlement: (id) => api.delete(`/enterprise/entitlements/${id}`).then((r) => r.data),

  statusPages: () => api.get('/enterprise/status-pages').then((r) => r.data.items || []),
  createStatusPage: (body) => api.post('/enterprise/status-pages', body).then((r) => r.data),
  updateStatusPage: (id, body) => api.put(`/enterprise/status-pages/${id}`, body).then((r) => r.data),
  deleteStatusPage: (id) => api.delete(`/enterprise/status-pages/${id}`).then((r) => r.data),
  addComponent: (id, body) => api.post(`/enterprise/status-pages/${id}/components`, body).then((r) => r.data),
  statusIncidents: () => api.get('/enterprise/status-incidents').then((r) => r.data.items || []),
  createStatusIncident: (body) => api.post('/enterprise/status-incidents', body).then((r) => r.data),
  updateStatusIncident: (id, body) => api.put(`/enterprise/status-incidents/${id}`, body).then((r) => r.data),

  surveys: () => api.get('/enterprise/surveys').then((r) => r.data.items || []),
  createSurvey: (body) => api.post('/enterprise/surveys', body).then((r) => r.data),
  updateSurvey: (id, body) => api.put(`/enterprise/surveys/${id}`, body).then((r) => r.data),
  deleteSurvey: (id) => api.delete(`/enterprise/surveys/${id}`).then((r) => r.data),
  surveyResults: (params) => api.get('/enterprise/surveys/results', { params }).then((r) => r.data),

  webhooks: () => api.get('/enterprise/webhooks').then((r) => r.data.items || []),
  createWebhook: (body) => api.post('/enterprise/webhooks', body).then((r) => r.data),
  updateWebhook: (id, body) => api.put(`/enterprise/webhooks/${id}`, body).then((r) => r.data),
  deleteWebhook: (id) => api.delete(`/enterprise/webhooks/${id}`).then((r) => r.data),
  webhookEvents: () => api.get('/enterprise/dev/webhooks/events').then((r) => r.data.events || []),

  apiKeys: () => api.get('/enterprise/api-keys').then((r) => r.data.items || []),
  createApiKey: (body) => api.post('/enterprise/api-keys', body).then((r) => r.data),
  deleteApiKey: (id) => api.delete(`/enterprise/api-keys/${id}`).then((r) => r.data),

  audit: (params) => api.get('/enterprise/audit', { params }).then((r) => r.data),
  realtime: () => api.get('/enterprise/realtime').then((r) => r.data),
  outageSignals: () => api.get('/enterprise/outage-signals').then((r) => r.data),
  promoteSignals: (signals) => api.post('/enterprise/outage-signals/promote', { signals }).then((r) => r.data),
};

export const WORKFLOW_EVENTS = [
  'ticket.created', 'ticket.updated', 'ticket.assigned', 'ticket.claimed', 'ticket.transferred',
  'ticket.replied', 'ticket.status_changed', 'ticket.priority_changed', 'ticket.overdue',
  'ticket.escalated', 'ticket.resolved', 'ticket.closed', 'ticket.reopened', 'customer.replied',
  'approval.completed', 'inbound.email', 'schedule.timer',
];

export const WORKFLOW_ACTIONS = [
  'notify_agent', 'notify_dept_manager', 'notify_admin', 'add_tags', 'remove_tags',
  'set_priority', 'assign_team', 'create_task', 'send_email', 'log',
];