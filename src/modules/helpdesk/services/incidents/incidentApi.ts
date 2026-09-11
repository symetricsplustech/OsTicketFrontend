import api from '@shared/lib/api';

export const incidentApi = {
  list: () => api.get('/enterprise/incidents'),
  create: (body: Record<string, unknown>) => api.post('/enterprise/incidents', body),
  update: (id: string, body: Record<string, unknown>) => api.put(`/enterprise/incidents/${id}`, body),
  getDiagnosis: (id: string) => api.get(`/ops/incidents/${id}/diagnosis`),
  saveDiagnosis: (id: string, body: Record<string, unknown>) => api.put(`/ops/incidents/${id}/diagnosis`, body),
  getWarRoom: (id: string) => api.get(`/ops/incidents/${id}/warroom`),
  postWarRoomMessage: (id: string, body: Record<string, unknown>) => api.post(`/ops/incidents/${id}/warroom`, body),
};
