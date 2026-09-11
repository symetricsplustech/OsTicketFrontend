import api from '@shared/lib/api';

export const assetApi = {
  list: (params?: Record<string, unknown>) => api.get('/enterprise/assets', { params }),
  get: (id: string) => api.get(`/enterprise/assets/${id}`),
  create: (body: Record<string, unknown>) => api.post('/enterprise/assets', body),
};
