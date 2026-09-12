import api from '@shared/lib/api';

export interface OnCallSchedule {
  _id: string; tenantId: string; number: string; name: string; description: string;
  timezone: string; team: string; status: string; scheduleType: string;
  startDate: string; endDate: string; handoverTime: string; handoverDuration: number;
  autoNotify: boolean; notifyBeforeMinutes: number; notifyChannels: string[];
  escalationPolicyId: string; metadata: Record<string, unknown>;
  createdAt: string; updatedAt: string;
}

export interface Shift {
  _id: string; tenantId: string; scheduleId: string; name: string;
  startDate: string; endDate: string; onCallAgent: { _id: string; name: string; email: string } | string;
  secondaryAgent: { _id: string; name: string; email: string } | string;
  status: string; handoverNotes: string; handoverCompleted: boolean;
  handoverCompletedAt: string; handoverCompletedBy: string;
  coverageRequests: string[]; createdAt: string; updatedAt: string;
}

export interface Roster {
  _id: string; tenantId: string; scheduleId: string; name: string; description: string;
  startDate: string; endDate: string; status: string; rotation: string;
  assignedMembers: string[]; minCoverage: number; maxCoverage: number;
  handoverWindow: string; createdAt: string; updatedAt: string;
}

export interface RosterMember {
  _id: string; tenantId: string; rosterId: string; userId: { _id: string; name: string; email: string } | string;
  role: string; order: number; startDate: string; endDate: string; isActive: boolean;
  createdAt: string;
}

export interface Rotation {
  _id: string; tenantId: string; scheduleId: string; name: string; type: string;
  pattern: { days: number[]; startTime: string; durationDays: number; handoverDay: number; handoverTime: string };
  members: string[]; currentIndex: number; nextHandoverDate: string; status: string;
  createdAt: string; updatedAt: string;
}

export interface CoverageRequest {
  _id: string; tenantId: string; scheduleId: string; shiftId: string;
  requesterId: { _id: string; name: string; email: string } | string;
  startDate: string; endDate: string; reason: string; type: string; status: string;
  targetUserId: string; approvedBy: string; approvedAt: string;
  rejectedBy: string; rejectedAt: string; rejectionReason: string;
  createdAt: string; updatedAt: string;
}

export interface TimeOffRequest {
  _id: string; tenantId: string; scheduleId: string; userId: { _id: string; name: string; email: string } | string;
  startDate: string; endDate: string; reason: string; status: string;
  approvedBy: string; approvedAt: string; rejectedBy: string; rejectedAt: string; rejectionReason: string;
  affectedShifts: string[]; createdAt: string; updatedAt: string;
}

export interface EscalationPolicy {
  _id: string; tenantId: string; number: string; name: string; description: string;
  isActive: boolean; isDefault: boolean; team: string;
  repeatAfterMinutes: number; maxRepeats: number; onCallOnly: boolean;
  createdAt: string; updatedAt: string;
}

export interface EscalationLevel {
  _id: string; tenantId: string; policyId: string; level: number; name: string;
  delayMinutes: number; targets: Array<{ type: string; value: string; order: number }>;
  notifyUntilAcknowledged: boolean; acknowledgementTimeoutMinutes: number; autoEscalateIfNoAck: boolean;
  createdAt: string; updatedAt: string;
}

export interface ContactPreference {
  _id: string; tenantId: string; userId: { _id: string; name: string; email: string } | string;
  onCallEmail: string; onCallSms: string; onCallVoice: string; onCallSlack: string; onCallTeams: string;
  preferredOrder: string[]; quietHours: { enabled: boolean; start: string; end: string; timezone: string };
  escalationMode: string; acknowledgeTimeoutMinutes: number;
  createdAt: string; updatedAt: string;
}

export interface OnCallDashboard {
  totalSchedules: number; activeSchedules: number; upcomingShifts: number;
  activeRosters: number; pendingCoverage: number; pendingTimeOff: number;
  escalationPolicies: number; activePolicies: number; contactsConfigured: number; conflicts: number;
}

export const oncallApi = {
  listSchedules: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: OnCallSchedule[] }>('/core/oncall/schedules', { params }),
  getSchedule: (id: string) => api.get<{ success: boolean; data: OnCallSchedule }>(`/core/oncall/schedules/${id}`),
  createSchedule: (data: Partial<OnCallSchedule>) => api.post<{ success: boolean; data: OnCallSchedule }>('/core/oncall/schedules', data),
  updateSchedule: (id: string, data: Partial<OnCallSchedule>) => api.put<{ success: boolean; data: OnCallSchedule }>(`/core/oncall/schedules/${id}`, data),
  deleteSchedule: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/schedules/${id}`),
  publishSchedule: (id: string) => api.post<{ success: boolean; data: OnCallSchedule }>(`/core/oncall/schedules/${id}/publish`),
  listShifts: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: Shift[] }>('/core/oncall/shifts', { params }),
  getShift: (id: string) => api.get<{ success: boolean; data: Shift }>(`/core/oncall/shifts/${id}`),
  createShift: (data: Partial<Shift>) => api.post<{ success: boolean; data: Shift }>('/core/oncall/shifts', data),
  updateShift: (id: string, data: Partial<Shift>) => api.put<{ success: boolean; data: Shift }>(`/core/oncall/shifts/${id}`, data),
  deleteShift: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/shifts/${id}`),
  completeHandover: (id: string, notes: string) => api.post<{ success: boolean; data: Shift }>(`/core/oncall/shifts/${id}/handover`, { notes }),
  listRosters: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: Roster[] }>('/core/oncall/rosters', { params }),
  getRoster: (id: string) => api.get<{ success: boolean; data: Roster }>(`/core/oncall/rosters/${id}`),
  createRoster: (data: Partial<Roster>) => api.post<{ success: boolean; data: Roster }>('/core/oncall/rosters', data),
  updateRoster: (id: string, data: Partial<Roster>) => api.put<{ success: boolean; data: Roster }>(`/core/oncall/rosters/${id}`, data),
  deleteRoster: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/rosters/${id}`),
  listRosterMembers: (rosterId: string) => api.get<{ success: boolean; data: RosterMember[] }>(`/core/oncall/rosters/${rosterId}/members`),
  addRosterMember: (rosterId: string, data: Partial<RosterMember>) => api.post<{ success: boolean; data: RosterMember }>(`/core/oncall/rosters/${rosterId}/members`, data),
  removeRosterMember: (rosterId: string, userId: string) => api.delete<{ success: boolean }>(`/core/oncall/rosters/${rosterId}/members/${userId}`),
  listRotations: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: Rotation[] }>('/core/oncall/rotations', { params }),
  getRotation: (id: string) => api.get<{ success: boolean; data: Rotation }>(`/core/oncall/rotations/${id}`),
  createRotation: (data: Partial<Rotation>) => api.post<{ success: boolean; data: Rotation }>('/core/oncall/rotations', data),
  updateRotation: (id: string, data: Partial<Rotation>) => api.put<{ success: boolean; data: Rotation }>(`/core/oncall/rotations/${id}`, data),
  deleteRotation: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/rotations/${id}`),
  advanceRotation: (id: string) => api.post<{ success: boolean; data: Rotation }>(`/core/oncall/rotations/${id}/advance`),
  listCoverageRequests: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: CoverageRequest[] }>('/core/oncall/coverage', { params }),
  getCoverageRequest: (id: string) => api.get<{ success: boolean; data: CoverageRequest }>(`/core/oncall/coverage/${id}`),
  createCoverageRequest: (data: Partial<CoverageRequest>) => api.post<{ success: boolean; data: CoverageRequest }>('/core/oncall/coverage', data),
  approveCoverageRequest: (id: string) => api.post<{ success: boolean; data: CoverageRequest }>(`/core/oncall/coverage/${id}/approve`),
  rejectCoverageRequest: (id: string, reason: string) => api.post<{ success: boolean; data: CoverageRequest }>(`/core/oncall/coverage/${id}/reject`, { reason }),
  listTimeOffRequests: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: TimeOffRequest[] }>('/core/oncall/timeoff', { params }),
  getTimeOffRequest: (id: string) => api.get<{ success: boolean; data: TimeOffRequest }>(`/core/oncall/timeoff/${id}`),
  createTimeOffRequest: (data: Partial<TimeOffRequest>) => api.post<{ success: boolean; data: TimeOffRequest }>('/core/oncall/timeoff', data),
  approveTimeOffRequest: (id: string) => api.post<{ success: boolean; data: TimeOffRequest }>(`/core/oncall/timeoff/${id}/approve`),
  rejectTimeOffRequest: (id: string, reason: string) => api.post<{ success: boolean; data: TimeOffRequest }>(`/core/oncall/timeoff/${id}/reject`, { reason }),
  listEscalationPolicies: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: EscalationPolicy[] }>('/core/oncall/escalation-policies', { params }),
  getEscalationPolicy: (id: string) => api.get<{ success: boolean; data: EscalationPolicy }>(`/core/oncall/escalation-policies/${id}`),
  createEscalationPolicy: (data: Partial<EscalationPolicy>) => api.post<{ success: boolean; data: EscalationPolicy }>('/core/oncall/escalation-policies', data),
  updateEscalationPolicy: (id: string, data: Partial<EscalationPolicy>) => api.put<{ success: boolean; data: EscalationPolicy }>(`/core/oncall/escalation-policies/${id}`, data),
  deleteEscalationPolicy: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/escalation-policies/${id}`),
  listEscalationLevels: (policyId: string) => api.get<{ success: boolean; data: EscalationLevel[] }>(`/core/oncall/escalation-policies/${policyId}/levels`),
  createEscalationLevel: (policyId: string, data: Partial<EscalationLevel>) => api.post<{ success: boolean; data: EscalationLevel }>(`/core/oncall/escalation-policies/${policyId}/levels`, data),
  updateEscalationLevel: (id: string, data: Partial<EscalationLevel>) => api.put<{ success: boolean; data: EscalationLevel }>(`/core/oncall/escalation-levels/${id}`, data),
  deleteEscalationLevel: (id: string) => api.delete<{ success: boolean }>(`/core/oncall/escalation-levels/${id}`),
  getContactPreference: (userId: string) => api.get<{ success: boolean; data: ContactPreference }>(`/core/oncall/contact-preferences/${userId}`),
  updateContactPreference: (userId: string, data: Partial<ContactPreference>) => api.put<{ success: boolean; data: ContactPreference }>(`/core/oncall/contact-preferences/${userId}`, data),
  getCurrentOnCall: (scheduleId: string) => api.get<{ success: boolean; data: Shift }>(`/core/oncall/current/${scheduleId}`),
  getUpcomingShifts: (scheduleId: string, days?: number) => api.get<{ success: boolean; data: Shift[] }>(`/core/oncall/upcoming/${scheduleId}`, { params: { days } }),
  getOnCallAgentForTeam: (teamId: string) => api.get<{ success: boolean; data: Shift }>(`/core/oncall/agent/team/${teamId}`),
  detectGaps: (scheduleId: string, days?: number) => api.get<{ success: boolean; data: { gaps: Array<{ from: string; to: string; durationMinutes: number }> } }>(`/core/oncall/gaps/${scheduleId}`, { params: { days } }),
  getDashboard: () => api.get<{ success: boolean; data: OnCallDashboard }>('/core/oncall/dashboard'),
  notifyUpcomingShifts: () => api.post<{ success: boolean; data: { notified: number } }>('/core/oncall/notify-upcoming'),
};

export default oncallApi;
