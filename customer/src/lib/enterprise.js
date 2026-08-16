import api from './api.js';

export const customerEn = {
  catalog: (params) => api.get('/public/service-catalog', { params }).then((r) => r.data),
  statusPage: (slug) => api.get(`/public/status/${slug}`).then((r) => r.data),
  surveysForTicket: (number) => api.get(`/public/csat/ticket/${number}`).then((r) => r.data),
  submitCsat: (body) => api.post('/public/csat/submit', body).then((r) => r.data),
  chatStart: (body) => api.post('/public/chat/start', body).then((r) => r.data),
  chatMessages: (id) => api.get(`/public/chat/${id}/messages`).then((r) => r.data),
  sendChat: (id, body) => api.post(`/public/chat/${id}/messages`, body).then((r) => r.data),
  closeChat: (id) => api.post(`/public/chat/${id}/close`).then((r) => r.data),
};