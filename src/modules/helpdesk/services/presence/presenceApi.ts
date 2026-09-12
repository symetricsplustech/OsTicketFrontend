import api from "@shared/lib/api";

export const presenceApi = {
  heartbeat: (ticketNumber: string) =>
    api.post(`/ops/tickets/${ticketNumber}/presence`),
  viewers: (ticketNumber: string) =>
    api.get(`/ops/tickets/${ticketNumber}/presence`),
  extractMentions: (body: {
    text: string;
    entityType: string;
    entityId: string;
  }) => api.post("/ops/mentions/extract", body),
};
