import api from "@shared/lib/api";

export const helpdeskAdminApi = {
  agents: () => api.get("/admin/agents"),
  departments: () => api.get("/admin/departments"),
  teams: () => api.get("/admin/teams"),
  helpTopics: () => api.get("/admin/help-topics"),
  cannedResponses: () => api.get("/agent/canned"),
  announcements: () => api.get("/agent/announcements"),
};
