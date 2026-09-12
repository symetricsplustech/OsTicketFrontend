import api from "@shared/lib/api";

export interface SLAPlan {
  _id: string;
  company: string;
  name: string;
  gracePeriod: number;
  schedule: "24/7" | "business_hours" | "custom";
  timezone: string;
  businessHours: { days: string[]; start: string; end: string };
  status: "active" | "draft" | "inactive";
  notes: string;
  targets: {
    first_response?: number;
    next_response?: number;
    resolution?: number;
    update?: number;
    assignment?: number;
    escalation?: number;
    callback?: number;
    approval?: number;
    task?: number;
    vendor?: number;
    closure?: number;
  };
  pauseRules: Record<string, boolean>;
  escalationRules: Array<{
    clock: string;
    afterMinutes: number;
    action: string;
  }>;
  pauseOnWaiting: boolean;
  notifyOnBreach: boolean;
  notifyOnAtRisk: boolean;
  breachEscalate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OLA {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  slaPlanId: SLAPlan | string;
  department: { name: string } | string;
  group: string;
  targets: { response?: number; resolution?: number; update?: number };
  schedule: string;
  timezone: string;
  isActive: boolean;
  status: string;
  totalTickets: number;
  breachedTickets: number;
  metTickets: number;
  complianceRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface UCTarget {
  _id: string;
  tenantId: string;
  contractId: string;
  number: string;
  name: string;
  metric: string;
  description: string;
  targetValue: number;
  targetUnit: string;
  comparisonOperator: string;
  measurementWindow: string;
  currentActual: number;
  lastMeasuredAt: string;
  isActive: boolean;
  status: string;
  breachCount: number;
  lastBreachAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSchedule {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  type: string;
  timezone: string;
  businessHours: Record<
    string,
    { enabled: boolean; start: string; end: string }
  >;
  holidays: string[];
  isActive: boolean;
  isDefault: boolean;
  slaPlanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayCalendar {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  timezone: string;
  holidays: Array<{
    name: string;
    date: string;
    isRecurring: boolean;
    type: string;
  }>;
  isActive: boolean;
  isDefault: boolean;
  holidayCount: number;
  scheduleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SLAEvent {
  _id: string;
  level: string;
  company: string;
  ticket: { number: string; subject: string };
  policy: string;
  event: string;
  clock: string;
  priority: string;
  startedAt: string;
  dueAt: string;
  completedAt: string;
  pausedDurationMs: number;
  durationMs: number;
  target: number;
  actual: number;
  reason: string;
  occurredAt: string;
  createdAt: string;
}

export interface SLARepairJob {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  status: string;
  triggeredBy: string;
  triggerReason: string;
  triggerType: string;
  slaPlanId: string;
  affectedTicketCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  startedAt: string;
  completedAt: string;
  actualDuration: number;
  createdAt: string;
}

export interface SLADashboard {
  totalPlans: number;
  activePlans: number;
  totalTickets: number;
  openTickets: number;
  breached: number;
  responseCompliance: number;
  resolutionCompliance: number;
  planStats: Array<{
    name: string;
    schedule: string;
    status: string;
    firstResponse: number;
    resolution: number;
  }>;
  recentBreaches: SLAEvent[];
  olas: OLA[];
}

export const slmApi = {
  listPlans: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: SLAPlan[] }>("/core/slm/plans", {
      params,
    }),
  getPlan: (id: string) =>
    api.get<{ success: boolean; data: SLAPlan }>(`/core/slm/plans/${id}`),
  createPlan: (data: Partial<SLAPlan>) =>
    api.post<{ success: boolean; data: SLAPlan }>("/core/slm/plans", data),
  updatePlan: (id: string, data: Partial<SLAPlan>) =>
    api.put<{ success: boolean; data: SLAPlan }>(`/core/slm/plans/${id}`, data),
  deletePlan: (id: string) =>
    api.delete<{ success: boolean }>(`/core/slm/plans/${id}`),
  clonePlan: (id: string, data: { name: string }) =>
    api.post<{ success: boolean; data: SLAPlan }>(
      `/core/slm/plans/${id}/clone`,
      data,
    ),
  listOLAs: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: OLA[] }>("/core/slm/olas", { params }),
  getOLA: (id: string) =>
    api.get<{ success: boolean; data: OLA }>(`/core/slm/olas/${id}`),
  createOLA: (data: Partial<OLA>) =>
    api.post<{ success: boolean; data: OLA }>("/core/slm/olas", data),
  updateOLA: (id: string, data: Partial<OLA>) =>
    api.put<{ success: boolean; data: OLA }>(`/core/slm/olas/${id}`, data),
  deleteOLA: (id: string) =>
    api.delete<{ success: boolean }>(`/core/slm/olas/${id}`),
  listUCTargets: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: UCTarget[] }>("/core/slm/uc-targets", {
      params,
    }),
  createUCTarget: (data: Partial<UCTarget>) =>
    api.post<{ success: boolean; data: UCTarget }>(
      "/core/slm/uc-targets",
      data,
    ),
  updateUCTarget: (id: string, data: Partial<UCTarget>) =>
    api.put<{ success: boolean; data: UCTarget }>(
      `/core/slm/uc-targets/${id}`,
      data,
    ),
  deleteUCTarget: (id: string) =>
    api.delete<{ success: boolean }>(`/core/slm/uc-targets/${id}`),
  measureUCTarget: (id: string, actualValue: number) =>
    api.post<{ success: boolean; data: UCTarget }>(
      `/core/slm/uc-targets/${id}/measure`,
      { actualValue },
    ),
  listSchedules: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: BusinessSchedule[] }>(
      "/core/slm/schedules",
      { params },
    ),
  getSchedule: (id: string) =>
    api.get<{ success: boolean; data: BusinessSchedule }>(
      `/core/slm/schedules/${id}`,
    ),
  createSchedule: (data: Partial<BusinessSchedule>) =>
    api.post<{ success: boolean; data: BusinessSchedule }>(
      "/core/slm/schedules",
      data,
    ),
  updateSchedule: (id: string, data: Partial<BusinessSchedule>) =>
    api.put<{ success: boolean; data: BusinessSchedule }>(
      `/core/slm/schedules/${id}`,
      data,
    ),
  deleteSchedule: (id: string) =>
    api.delete<{ success: boolean }>(`/core/slm/schedules/${id}`),
  listCalendars: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: HolidayCalendar[] }>(
      "/core/slm/calendars",
      { params },
    ),
  createCalendar: (data: Partial<HolidayCalendar>) =>
    api.post<{ success: boolean; data: HolidayCalendar }>(
      "/core/slm/calendars",
      data,
    ),
  updateCalendar: (id: string, data: Partial<HolidayCalendar>) =>
    api.put<{ success: boolean; data: HolidayCalendar }>(
      `/core/slm/calendars/${id}`,
      data,
    ),
  deleteCalendar: (id: string) =>
    api.delete<{ success: boolean }>(`/core/slm/calendars/${id}`),
  getEvents: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: SLAEvent[] }>("/core/slm/events", {
      params,
    }),
  getTimeline: (ticketId: string) =>
    api.get<{
      success: boolean;
      data: { events: SLAEvent[]; breakdowns: unknown[] };
    }>(`/core/slm/timeline/${ticketId}`),
  listRepairJobs: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: SLARepairJob[] }>(
      "/core/slm/repair-jobs",
      { params },
    ),
  createRepairJob: (data: Partial<SLARepairJob>) =>
    api.post<{ success: boolean; data: SLARepairJob }>(
      "/core/slm/repair-jobs",
      data,
    ),
  startRepairJob: (id: string) =>
    api.post<{ success: boolean; data: SLARepairJob }>(
      `/core/slm/repair-jobs/${id}/start`,
    ),
  completeRepairJob: (
    id: string,
    result: {
      completed: boolean;
      processed: number;
      succeeded: number;
      failures: number;
    },
  ) =>
    api.post<{ success: boolean; data: SLARepairJob }>(
      `/core/slm/repair-jobs/${id}/complete`,
      result,
    ),
  getDashboard: () =>
    api.get<{ success: boolean; data: SLADashboard }>("/core/slm/dashboard"),
  recalculate: (slaPlanId: string) =>
    api.post<{
      success: boolean;
      data: { recalculated: number; total: number };
    }>("/core/slm/recalculate", { slaPlanId }),
};

export default slmApi;
