import api from "@shared/lib/api";

export type DashboardStats = {
  open: number;
  assigned: number;
  overdue: number;
  closed: number;
};

export type DashboardTicket = {
  _id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name: string };
};

export const dashboardApi = {
  customer: async () => {
    const { data } = await api.get<{
      stats: DashboardStats;
      recent: Array<Omit<DashboardTicket, "title"> & { subject: string }>;
    }>("/tickets/dashboard");
    return {
      stats: data.stats,
      recent: data.recent.map(({ subject, ...ticket }) => ({ ...ticket, title: subject })),
    };
  },
  agent: async () => {
    const [dashboard, tickets] = await Promise.all([
      api.get("/agent/dashboard"), api.get("/agent/tickets?limit=5"),
    ]);
    return {
      stats: dashboard.data.stats || dashboard.data,
      recent: tickets.data.tickets || [],
    } as { stats: DashboardStats; recent: DashboardTicket[] };
  },
};
