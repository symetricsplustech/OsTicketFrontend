import { api } from './index.js';

export const en = {
  // AI
  intelligence: (number) => api.get(`/ai/intelligence/${number}`).then((r) => r.data.item),
  refreshIntelligence: (number) => api.post(`/ai/intelligence/${number}/refresh`).then((r) => r.data.item),
  aiAction: (kind, number, body = {}) => {
    const urls = { summarize: '/ai/summarize', rewrite: '/ai/rewrite', translate: '/ai/translate', assist: `/ai/assist/${number}` };
    return api.post(urls[kind], body).then((r) => r.data);
  },
  qaTicket: (number) => api.post(`/ai/qa/${number}`).then((r) => r.data),
  handoff: (number, body) => api.post(`/ai/handoff/${number}`, body).then((r) => r.data),

  // Incidents / problems / changes
  incidents: (params) => api.get('/enterprise/incidents', { params }).then((r) => r.data),
  createIncident: (body) => api.post('/enterprise/incidents', body).then((r) => r.data),
  updateIncident: (id, body) => api.put(`/enterprise/incidents/${id}`, body).then((r) => r.data),
  addIncidentTimeline: (id, body) => api.post(`/enterprise/incidents/${id}/timeline`, body).then((r) => r.data),
  linkTicketsToIncident: (id, body) => api.post(`/enterprise/incidents/${id}/link-tickets`, body).then((r) => r.data),
  problems: (params) => api.get('/enterprise/problems', { params }).then((r) => r.data),
  createProblem: (body) => api.post('/enterprise/problems', body).then((r) => r.data),
  changes: (params) => api.get('/enterprise/changes', { params }).then((r) => r.data),
  createChange: (body) => api.post('/enterprise/changes', body).then((r) => r.data),
  requestChangeApproval: (id) => api.post(`/enterprise/changes/${id}/request-approval`).then((r) => r.data),

  // Assets / CMDB
  assets: (params) => api.get('/enterprise/assets', { params }).then((r) => r.data),
  createAsset: (body) => api.post('/enterprise/assets', body).then((r) => r.data),
  assetImpact: (id) => api.get(`/enterprise/assets/${id}/impact`).then((r) => r.data),

  // Approvals
  approvals: (params, mine = false) => api.get(mine ? '/enterprise/approvals/mine' : '/enterprise/approvals', { params }).then((r) => r.data),
  decideApproval: (id, decision, body = {}) => api.post(`/enterprise/approvals/${id}/decide`, { decision, ...body }).then((r) => r.data),
  delegateApproval: (id, body) => api.post(`/enterprise/approvals/${id}/delegate`, body).then((r) => r.data),

  // Chat
  conversations: (params) => api.get('/enterprise/conversations', { params }).then((r) => r.data),
  conversation: (id) => api.get(`/enterprise/conversations/${id}`).then((r) => r.data),
  postChat: (id, body) => api.post(`/enterprise/conversations/${id}/messages`, body).then((r) => r.data),
  assignConversation: (id, body) => api.post(`/enterprise/conversations/${id}/assign`, body).then((r) => r.data),
  closeConversation: (id) => api.post(`/enterprise/conversations/${id}/close`).then((r) => r.data),

  // Reports + realtime + search + audit
  reportOverview: (days = 30) => api.get('/enterprise/reports/overview', { params: { days } }).then((r) => r.data),
  reportAgents: (days = 30) => api.get('/enterprise/reports/agents', { params: { days } }).then((r) => r.data),
  reportDepartments: (days = 30) => api.get('/enterprise/reports/departments', { params: { days } }).then((r) => r.data),
  reportCustomers: (days = 30) => api.get('/enterprise/reports/customers', { params: { days } }).then((r) => r.data),
  reportVolume: (days = 30) => api.get('/enterprise/reports/volume', { params: { days } }).then((r) => r.data),
  realtime: () => api.get('/enterprise/realtime').then((r) => r.data),
  search: (q, filters = {}) => api.get('/enterprise/search', { params: { q, ...filters } }).then((r) => r.data),
  auditLogs: (params) => api.get('/enterprise/audit', { params }).then((r) => r.data),

  // Customer 360
  customer360: (id) => api.get(`/enterprise/customer360/${id}`).then((r) => r.data),

  // Ticket links
  ticketLinks: (number) => api.get(`/enterprise/tickets/${number}/links`).then((r) => r.data),
  addTicketLink: (number, body) => api.post(`/enterprise/tickets/${number}/links`, body).then((r) => r.data),
  removeTicketLink: (number, linkId) => api.delete(`/enterprise/tickets/${number}/links/${linkId}`).then((r) => r.data),

  // Service catalog (public-facing via agent admin)
  catalog: () => api.get('/enterprise/catalog').then((r) => r.data),
};

export const REPORT_SCALES = {
  agents: 'First-response / resolution / SLA % / CSAT',
  departments: 'Volume / SLA compliance per dept',
  customers: 'Tickets / health per customer',
  volume: 'Created vs resolved per day',
};
