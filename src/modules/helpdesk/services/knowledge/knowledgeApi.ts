import api from '@shared/lib/api';

export const knowledgeApi = {
  suggest: (query: string) => api.get('/agent/kb/suggest', { params: { q: query.slice(0, 200) } }),
  vote: (faqId: string, helpful: boolean) => api.post(`/kb/faqs/${faqId}/vote`, { helpful }),
};
