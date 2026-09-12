import api from "@shared/lib/api";

export interface ApprovalDefinition {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  isActive: boolean;
  entityType: string;
  conditions: {
    matchAll: boolean;
    rules: Array<{ field: string; operator: string; value: unknown }>;
  };
  approvalMode: string;
  requiredApprovals: number;
  steps: Array<{
    order: number;
    name: string;
    assigneeType: string;
    assignee: string;
    mode: string;
    timeoutHours: number;
    autoApproveOnTimeout: boolean;
    required: boolean;
  }>;
  escalation: {
    enabled: boolean;
    afterHours: number;
    escalateTo: string;
    action: string;
  };
  timeout: { enabled: boolean; afterHours: number; action: string };
  hitCount: number;
  lastHitAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStepData {
  _id: string;
  stepNumber: number;
  name: string;
  assigneeType: string;
  assignee: string;
  assigneeName: string;
  mode: string;
  status: string;
  decidedBy: string;
  decidedByName: string;
  decidedAt: string;
  comment: string;
  delegatedTo: string;
  escalated: boolean;
  dueAt: string;
  approvers: Array<{
    _id: string;
    userId: string;
    userName: string;
    status: string;
    decidedAt: string;
    comment: string;
  }>;
}

export interface ApprovalInstance {
  _id: string;
  tenantId: string;
  number: string;
  entityType: string;
  entityId: string;
  entityNumber: string;
  title: string;
  description: string;
  status: string;
  mode: string;
  currentStep: number;
  totalSteps: number;
  requiredApprovals: number;
  approvalCount: number;
  rejectionCount: number;
  initiatedBy: string;
  initiatedByName: string;
  completedAt: string;
  dueAt: string;
  result: string;
  steps?: ApprovalStepData[];
  createdAt: string;
  updatedAt: string;
}

export interface Delegation {
  _id: string;
  delegatorId: string;
  delegateId: string;
  reason: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  scopes: { allApprovals: boolean; entityTypes: string[] };
  approvalsDelegated: number;
  createdAt: string;
}

export interface ApprovalDecision {
  _id: string;
  instanceId: string;
  stepId: string;
  approverId: string;
  approverName: string;
  decision: string;
  comment: string;
  isAutoDecision: boolean;
  autoReason: string;
  createdAt: string;
}

export interface ApprovalDashboard {
  totalDefinitions: number;
  activeDefinitions: number;
  totalInstances: number;
  statusCounts: Record<string, number>;
  overdue: number;
  avgCompletionHours: number;
  activeDelegations: number;
  entityTypeBreakdown: Record<string, number>;
}

export const approvalEngineApi = {
  // Definitions
  listDefinitions: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: ApprovalDefinition[] }>(
      "/core/approval-engine/definitions",
      { params },
    ),
  getDefinition: (id: string) =>
    api.get<{ success: boolean; data: ApprovalDefinition }>(
      `/core/approval-engine/definitions/${id}`,
    ),
  createDefinition: (data: Partial<ApprovalDefinition>) =>
    api.post<{ success: boolean; data: ApprovalDefinition }>(
      "/core/approval-engine/definitions",
      data,
    ),
  updateDefinition: (id: string, data: Partial<ApprovalDefinition>) =>
    api.put<{ success: boolean; data: ApprovalDefinition }>(
      `/core/approval-engine/definitions/${id}`,
      data,
    ),
  deleteDefinition: (id: string) =>
    api.delete<{ success: boolean }>(`/core/approval-engine/definitions/${id}`),
  evaluatePolicy: (entityType: string, entity: Record<string, unknown>) =>
    api.post<{ success: boolean; data: ApprovalDefinition | null }>(
      "/core/approval-engine/evaluate",
      { entityType, entity },
    ),
  // Instances
  listInstances: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: ApprovalInstance[] }>(
      "/core/approval-engine/instances",
      { params },
    ),
  getInstance: (id: string) =>
    api.get<{ success: boolean; data: ApprovalInstance }>(
      `/core/approval-engine/instances/${id}`,
    ),
  getInstanceDetail: (id: string) =>
    api.get<{ success: boolean; data: ApprovalInstance }>(
      `/core/approval-engine/instances/${id}/detail`,
    ),
  createInstance: (data: Partial<ApprovalInstance>) =>
    api.post<{ success: boolean; data: ApprovalInstance }>(
      "/core/approval-engine/instances",
      data,
    ),
  decide: (
    instanceId: string,
    stepId: string,
    decision: string,
    comment?: string,
  ) =>
    api.post<{ success: boolean; data: ApprovalInstance }>(
      `/core/approval-engine/instances/${instanceId}/steps/${stepId}/decide`,
      { decision, comment },
    ),
  batchDecide: (
    instanceId: string,
    decisions: Array<{ stepId: string; decision: string; comment?: string }>,
  ) =>
    api.post<{ success: boolean; data: ApprovalInstance }>(
      `/core/approval-engine/instances/${instanceId}/batch-decide`,
      { decisions },
    ),
  // Delegations
  listDelegations: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Delegation[] }>(
      "/core/approval-engine/delegations",
      { params },
    ),
  createDelegation: (data: Partial<Delegation>) =>
    api.post<{ success: boolean; data: Delegation }>(
      "/core/approval-engine/delegations",
      data,
    ),
  updateDelegation: (id: string, data: Partial<Delegation>) =>
    api.put<{ success: boolean; data: Delegation }>(
      `/core/approval-engine/delegations/${id}`,
      data,
    ),
  deleteDelegation: (id: string) =>
    api.delete<{ success: boolean }>(`/core/approval-engine/delegations/${id}`),
  // Decisions
  getDecisionHistory: (instanceId: string) =>
    api.get<{ success: boolean; data: ApprovalDecision[] }>(
      `/core/approval-engine/instances/${instanceId}/decisions`,
    ),
  getRecentDecisions: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: ApprovalDecision[] }>(
      "/core/approval-engine/decisions",
      { params },
    ),
  // Pending / Dashboard
  getPendingForUser: () =>
    api.get<{ success: boolean; data: ApprovalInstance[] }>(
      "/core/approval-engine/pending",
    ),
  getDashboard: () =>
    api.get<{ success: boolean; data: ApprovalDashboard }>(
      "/core/approval-engine/dashboard",
    ),
  getStats: () =>
    api.get<{ success: boolean; data: Record<string, unknown> }>(
      "/core/approval-engine/stats",
    ),
  // Admin
  processTimeouts: () =>
    api.post<{ success: boolean; data: { processed: number } }>(
      "/core/approval-engine/process-timeouts",
    ),
  processEscalations: () =>
    api.post<{ success: boolean; data: { escalated: number } }>(
      "/core/approval-engine/process-escalations",
    ),
};

export default approvalEngineApi;
