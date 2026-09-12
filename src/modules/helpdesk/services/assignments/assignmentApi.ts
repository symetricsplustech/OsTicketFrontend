import api from "@shared/lib/api";

export interface AssignmentRule {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: {
    matchAll: boolean;
    rules: Array<{ field: string; operator: string; value: unknown }>;
  };
  actions: Array<{ type: string; target: string; value: unknown }>;
  assignmentStrategy: string;
  targetGroups: string[];
  targetAgents: string[];
  requiredSkills: string[];
  fallbackAction: string;
  hitCount: number;
  lastHitAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Queue {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  isDefault: boolean;
  department: string;
  routingStrategy: string;
  overflowAction: string;
  overflowAfterMinutes: number;
  ticketCount: number;
  openCount: number;
  backlogCount: number;
  slaBreachedCount: number;
  averageWaitMinutes: number;
  members: { groups: string[]; agents: string[] };
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  category: string;
  group: string;
  isActive: boolean;
  agentCount: number;
  requiredByRules: number;
  proficiencyLevels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentSkill {
  _id: string;
  agentId: string;
  skillId: Skill | string;
  proficiency: string;
  certified: boolean;
  certifiedAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface AgentPresenceRecord {
  _id: string;
  agentId: string;
  status: string;
  previousStatus: string;
  reason: string;
  ticketNumber: string;
  since: string;
  expectedReturn: string;
  isManual: boolean;
  source: string;
  createdAt: string;
}

export interface AgentCapacity {
  _id: string;
  agentId: string;
  maxCapacity: number;
  currentLoad: number;
  utilizationPercent: number;
  assignedTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  overdueTickets: number;
  isOverloaded: boolean;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingRule {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  source: string;
  conditions: {
    matchAll: boolean;
    rules: Array<{ field: string; operator: string; value: unknown }>;
  };
  routingMethod: string;
  targetQueue: string;
  targetGroup: string;
  targetAgent: string;
  requiredSkills: string[];
  autoAssign: boolean;
  hitCount: number;
  lastHitAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentEvent {
  _id: string;
  ticketId: string;
  ticketNumber: string;
  eventType: string;
  fromAgent: string;
  toAgent: string;
  fromGroup: string;
  toGroup: string;
  reason: string;
  method: string;
  slaImpact: string;
  performedBy: string;
  createdAt: string;
}

export interface AssignmentDashboard {
  queues: number;
  totalTickets: number;
  openTickets: number;
  assignmentRules: number;
  activeRules: number;
  routingRules: number;
  activeRoutingRules: number;
  skills: number;
  activeSkills: number;
  agents: number;
  totalCapacity: number;
  totalLoad: number;
  utilizationPercent: number;
  overloaded: number;
  agentPresence: Record<string, number>;
}

export const assignmentApi = {
  listRules: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: AssignmentRule[] }>(
      "/core/assignments/rules",
      { params },
    ),
  getRule: (id: string) =>
    api.get<{ success: boolean; data: AssignmentRule }>(
      `/core/assignments/rules/${id}`,
    ),
  createRule: (data: Partial<AssignmentRule>) =>
    api.post<{ success: boolean; data: AssignmentRule }>(
      "/core/assignments/rules",
      data,
    ),
  updateRule: (id: string, data: Partial<AssignmentRule>) =>
    api.put<{ success: boolean; data: AssignmentRule }>(
      `/core/assignments/rules/${id}`,
      data,
    ),
  deleteRule: (id: string) =>
    api.delete<{ success: boolean }>(`/core/assignments/rules/${id}`),
  listQueues: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Queue[] }>("/core/assignments/queues", {
      params,
    }),
  getQueue: (id: string) =>
    api.get<{ success: boolean; data: Queue }>(
      `/core/assignments/queues/${id}`,
    ),
  createQueue: (data: Partial<Queue>) =>
    api.post<{ success: boolean; data: Queue }>(
      "/core/assignments/queues",
      data,
    ),
  updateQueue: (id: string, data: Partial<Queue>) =>
    api.put<{ success: boolean; data: Queue }>(
      `/core/assignments/queues/${id}`,
      data,
    ),
  deleteQueue: (id: string) =>
    api.delete<{ success: boolean }>(`/core/assignments/queues/${id}`),
  getQueueStats: (id: string) =>
    api.get<{ success: boolean; data: Record<string, number> }>(
      `/core/assignments/queues/${id}/stats`,
    ),
  listSkills: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Skill[] }>("/core/assignments/skills", {
      params,
    }),
  getSkill: (id: string) =>
    api.get<{ success: boolean; data: Skill }>(
      `/core/assignments/skills/${id}`,
    ),
  createSkill: (data: Partial<Skill>) =>
    api.post<{ success: boolean; data: Skill }>(
      "/core/assignments/skills",
      data,
    ),
  updateSkill: (id: string, data: Partial<Skill>) =>
    api.put<{ success: boolean; data: Skill }>(
      `/core/assignments/skills/${id}`,
      data,
    ),
  deleteSkill: (id: string) =>
    api.delete<{ success: boolean }>(`/core/assignments/skills/${id}`),
  listAgentSkills: (agentId: string) =>
    api.get<{ success: boolean; data: AgentSkill[] }>(
      `/core/assignments/agents/${agentId}/skills`,
    ),
  assignSkill: (agentId: string, skillId: string, data: Partial<AgentSkill>) =>
    api.post<{ success: boolean; data: AgentSkill }>(
      `/core/assignments/agents/${agentId}/skills/${skillId}`,
      data,
    ),
  removeSkill: (agentId: string, skillId: string) =>
    api.delete<{ success: boolean }>(
      `/core/assignments/agents/${agentId}/skills/${skillId}`,
    ),
  getPresence: (agentId: string) =>
    api.get<{ success: boolean; data: AgentPresenceRecord }>(
      `/core/assignments/agents/${agentId}/presence`,
    ),
  getPresenceHistory: (agentId: string, params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: AgentPresenceRecord[] }>(
      `/core/assignments/agents/${agentId}/presence/history`,
      { params },
    ),
  setPresence: (agentId: string, data: { status: string; reason?: string }) =>
    api.post<{ success: boolean; data: AgentPresenceRecord }>(
      `/core/assignments/agents/${agentId}/presence`,
      data,
    ),
  getPresenceStats: () =>
    api.get<{
      success: boolean;
      data: { total: number; byStatus: Record<string, number> };
    }>("/core/assignments/presence/stats"),
  getCapacity: (agentId: string) =>
    api.get<{ success: boolean; data: AgentCapacity }>(
      `/core/assignments/agents/${agentId}/capacity`,
    ),
  getCapacityStats: () =>
    api.get<{ success: boolean; data: Record<string, number> }>(
      "/core/assignments/capacity/stats",
    ),
  updateCapacity: (agentId: string, data: Partial<AgentCapacity>) =>
    api.put<{ success: boolean; data: AgentCapacity }>(
      `/core/assignments/agents/${agentId}/capacity`,
      data,
    ),
  recalculateCapacity: (agentId: string) =>
    api.post<{ success: boolean; data: AgentCapacity }>(
      `/core/assignments/agents/${agentId}/capacity/recalculate`,
    ),
  listRoutingRules: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: RoutingRule[] }>(
      "/core/assignments/routing-rules",
      { params },
    ),
  getRoutingRule: (id: string) =>
    api.get<{ success: boolean; data: RoutingRule }>(
      `/core/assignments/routing-rules/${id}`,
    ),
  createRoutingRule: (data: Partial<RoutingRule>) =>
    api.post<{ success: boolean; data: RoutingRule }>(
      "/core/assignments/routing-rules",
      data,
    ),
  updateRoutingRule: (id: string, data: Partial<RoutingRule>) =>
    api.put<{ success: boolean; data: RoutingRule }>(
      `/core/assignments/routing-rules/${id}`,
      data,
    ),
  deleteRoutingRule: (id: string) =>
    api.delete<{ success: boolean }>(`/core/assignments/routing-rules/${id}`),
  getHistory: (ticketId: string) =>
    api.get<{ success: boolean; data: AssignmentEvent[] }>(
      `/core/assignments/history/ticket/${ticketId}`,
    ),
  getHistoryByNumber: (ticketNumber: string) =>
    api.get<{ success: boolean; data: AssignmentEvent[] }>(
      `/core/assignments/history/number/${ticketNumber}`,
    ),
  getRecentEvents: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: AssignmentEvent[] }>(
      "/core/assignments/events",
      { params },
    ),
  evaluateRules: (ticket: Record<string, unknown>) =>
    api.post<{ success: boolean; data: AssignmentRule | null }>(
      "/core/assignments/evaluate",
      ticket,
    ),
  evaluateRoutingRules: (ticket: Record<string, unknown>) =>
    api.post<{ success: boolean; data: RoutingRule | null }>(
      "/core/assignments/evaluate-routing",
      ticket,
    ),
  findBestAgent: (options: Record<string, unknown>) =>
    api.post<{ success: boolean; data: { _id: string; name: string } | null }>(
      "/core/assignments/find-agent",
      options,
    ),
  diagnose: (ticket: Record<string, unknown>) =>
    api.post<{ success: boolean; data: unknown }>(
      "/core/assignments/diagnose",
      ticket,
    ),
  offerWork: (ticketId: string, agentId: string) =>
    api.post<{ success: boolean; data: AssignmentEvent }>(
      `/core/assignments/tickets/${ticketId}/offer`,
      { agentId },
    ),
  acceptWork: (ticketId: string, agentId: string) =>
    api.post<{ success: boolean; data: AssignmentEvent }>(
      `/core/assignments/tickets/${ticketId}/offer/${agentId}/accept`,
    ),
  declineWork: (ticketId: string, agentId: string, reason?: string) =>
    api.post<{ success: boolean; data: AssignmentEvent }>(
      `/core/assignments/tickets/${ticketId}/offer/${agentId}/decline`,
      { reason },
    ),
  getDashboard: () =>
    api.get<{ success: boolean; data: AssignmentDashboard }>(
      "/core/assignments/dashboard",
    ),
};

export default assignmentApi;
