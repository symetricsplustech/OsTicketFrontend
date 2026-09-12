import api from "@shared/lib/api";

export const ticketApi = {
  get: (number: string) => api.get(`/agent/tickets/${number}`),
  getAgents: () => api.get("/admin/agents"),
  getDepartments: () => api.get("/admin/departments"),
  getClosureCodes: () => api.get("/gaps2/closure-codes"),
  getSlaHistory: (number: string) =>
    api.get(`/agent/tickets/${number}/sla-history`),
  summarize: (number: string) =>
    api.post("/agent/assist/summarize", { ticketNumber: number }),
  addNote: (number: string, message: string) =>
    api.post(`/agent/tickets/${number}/note`, { message }),
  reply: (number: string, body: FormData) =>
    api.post(`/agent/tickets/${number}/reply`, body, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStatus: (
    number: string,
    status: string,
    resolution?: Record<string, string>,
  ) =>
    api.post(`/agent/tickets/${number}/status`, {
      status,
      ...(resolution ? { resolution } : {}),
    }),
  assign: (number: string, agentId: string) =>
    api.post(`/agent/tickets/${number}/assign`, { agentId }),
  transfer: (number: string, deptId: string) =>
    api.post(`/agent/tickets/${number}/transfer`, { deptId }),
  addTask: (number: string, title: string) =>
    api.post(`/agent/tickets/${number}/tasks`, { title, status: "open" }),
  updateTask: (number: string, taskId: string, status: string) =>
    api.put(`/agent/tickets/${number}/tasks/${taskId}`, { status }),
  updateSla: (number: string, action: "pause" | "resume") =>
    api.post(`/agent/tickets/${number}/sla/${action}`, {}),
  saveClosure: (number: string, resolutionCode: string, closureCode: string) =>
    api.put(`/gaps2/tickets/${number}/closure`, {
      resolutionCode,
      closureCode,
    }),
  linkAsset: (number: string, asset: string) =>
    api.post(`/agent/tickets/${number}/fields`, { asset }),
  merge: (number: string, targetNumber: string) =>
    api.post(`/agent/tickets/${number}/merge`, { targetNumber }),
  split: (number: string, subject: string, threadIds: string[]) =>
    api.post(`/agent/tickets/${number}/split`, { subject, threadIds }),
};
