import api from '@shared/lib/api';

export interface Release {
  _id: string; tenantId: string; number: string; name: string; description: string;
  type: string; status: string; priority: string;
  version: string; previousVersion: string; environment: string;
  startDate: string; endDate: string; plannedStartDate: string; plannedEndDate: string;
  actualStartDate: string; actualEndDate: string;
  releaseManagerId: string; releaseCoordinatorId: string; approvalGroupId: string;
  isRollback: boolean; rollbackReleaseId: string; rollbackReason: string;
  rolloutStrategy: string; rolloutPercentage: number;
  metadata: Record<string, unknown>; createdAt: string; updatedAt: string;
}

export interface ReleasePhase {
  _id: string; tenantId: string; releaseId: string; number: string; name: string; description: string;
  order: number; type: string; status: string;
  startDate: string; endDate: string; plannedStartDate: string; plannedEndDate: string;
  actualStartDate: string; actualEndDate: string;
  ownerId: string; approverIds: string[]; approvalStatus: string; approvalRequired: boolean;
  gateCriteria: string; gateResult: string; metadata: Record<string, unknown>;
  createdAt: string; updatedAt: string;
}

export interface ReleaseTask {
  _id: string; tenantId: string; releaseId: string; phaseId: string; number: string;
  name: string; description: string; type: string; status: string; priority: string;
  assigneeId: string; startDate: string; endDate: string; plannedStartDate: string; plannedEndDate: string;
  actualStartDate: string; actualEndDate: string; estimatedDuration: number; actualDuration: number;
  dependencies: Array<{ taskId: string; type: string }>;
  isAutomated: boolean; automationScript: string; automationParams: Record<string, unknown>;
  scriptOutput: string; scriptExitCode: number; isRollbackTask: boolean;
  createdAt: string; updatedAt: string;
}

export interface ReleaseComponent {
  _id: string; tenantId: string; releaseId: string; number: string; name: string; description: string;
  type: string; version: string; previousVersion: string;
  sourceRepository: string; sourceBranch: string; commitHash: string;
  buildArtifact: string; buildUrl: string; buildStatus: string;
  artifactUrl: string; artifactChecksum: string; environment: string;
  deployedAt: string; deployedBy: string; deploymentStatus: string;
  createdAt: string; updatedAt: string;
}

export interface ReleaseDependency {
  _id: string; tenantId: string; releaseId: string; number: string; name: string; description: string;
  type: string; dependencyType: string;
  targetReleaseId: string; targetChangeId: string; targetCiId: string; targetServiceId: string; targetEnvironment: string;
  status: string; severity: string; resolutionNotes: string; resolvedAt: string;
  createdAt: string; updatedAt: string;
}

export interface ReleaseApproval {
  _id: string; tenantId: string; releaseId: string; number: string; name: string; description: string;
  type: string; status: string; approverIds: string[]; requiredApprovals: number;
  currentApprovals: number; currentRejections: number;
  approvers: Array<{ userId: string; status: string; decidedAt: string; comment: string }>;
  criteria: string; decidedAt: string; expiresAt: string;
  createdAt: string; updatedAt: string;
}

export interface ReleaseDeployment {
  _id: string; tenantId: string; releaseId: string; number: string; name: string;
  environment: string; status: string; deploymentType: string; rolloutPercentage: number; strategy: string;
  scheduledAt: string; startedAt: string; completedAt: string; deployedBy: string;
  deployedComponents: Array<{ componentId: string; version: string; status: string; deployedAt: string; healthCheckStatus: string }>;
  preDeploymentChecks: Array<{ name: string; status: string; result: string }>;
  postDeploymentChecks: Array<{ name: string; status: string; result: string }>;
  rollbackReason: string; rollbackInitiatedAt: string;
  createdAt: string; updatedAt: string;
}

export interface ReleaseDashboard {
  totalReleases: number; activeReleases: number; completedReleases: number; failedReleases: number;
  statusBreakdown: Record<string, number>;
  totalPhases: number; phaseStatusBreakdown: Record<string, number>;
  totalTasks: number; taskStatusBreakdown: Record<string, number>;
  completedTasks: number; totalDeployments: number; deploymentStatusBreakdown: Record<string, number>;
  pendingApprovals: number; pendingDependencies: number; blockedDependencies: number;
  failedTasks: number; blockedTasks: number;
}

export const releaseApi = {
  // Releases
  listReleases: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: Release[] }>('/core/release/releases', { params }),
  getRelease: (id: string) => api.get<{ success: boolean; data: Release }>(`/core/release/releases/${id}`),
  createRelease: (data: Partial<Release>) => api.post<{ success: boolean; data: Release }>('/core/release/releases', data),
  updateRelease: (id: string, data: Partial<Release>) => api.put<{ success: boolean; data: Release }>(`/core/release/releases/${id}`, data),
  deleteRelease: (id: string) => api.delete<{ success: boolean }>(`/core/release/releases/${id}`),
  transitionRelease: (id: string, status: string) => api.post<{ success: boolean; data: Release }>(`/core/release/releases/${id}/transition`, { status }),
  
  // Phases
  listPhases: (releaseId: string) => api.get<{ success: boolean; data: ReleasePhase[] }>(`/core/release/releases/${releaseId}/phases`),
  getPhase: (id: string) => api.get<{ success: boolean; data: ReleasePhase }>(`/core/release/phases/${id}`),
  createPhase: (releaseId: string, data: Partial<ReleasePhase>) => api.post<{ success: boolean; data: ReleasePhase }>(`/core/release/releases/${releaseId}/phases`, data),
  updatePhase: (id: string, data: Partial<ReleasePhase>) => api.put<{ success: boolean; data: ReleasePhase }>(`/core/release/phases/${id}`, data),
  deletePhase: (id: string) => api.delete<{ success: boolean }>(`/core/release/phases/${id}`),
  
  // Tasks
  listTasks: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ReleaseTask[] }>(`/core/release/tasks`, { params }),
  getTask: (id: string) => api.get<{ success: boolean; data: ReleaseTask }>(`/core/release/tasks/${id}`),
  createTask: (data: Partial<ReleaseTask>) => api.post<{ success: boolean; data: ReleaseTask }>(`/core/release/tasks`, data),
  updateTask: (id: string, data: Partial<ReleaseTask>) => api.put<{ success: boolean; data: ReleaseTask }>(`/core/release/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete<{ success: boolean }>(`/core/release/tasks/${id}`),
  executeTask: (id: string) => api.post<{ success: boolean; data: ReleaseTask }>(`/core/release/tasks/${id}/execute`),
  
  // Components
  listComponents: (releaseId: string) => api.get<{ success: boolean; data: ReleaseComponent[] }>(`/core/release/releases/${releaseId}/components`),
  getComponent: (id: string) => api.get<{ success: boolean; data: ReleaseComponent }>(`/core/release/components/${id}`),
  createComponent: (releaseId: string, data: Partial<ReleaseComponent>) => api.post<{ success: boolean; data: ReleaseComponent }>(`/core/release/releases/${releaseId}/components`, data),
  updateComponent: (id: string, data: Partial<ReleaseComponent>) => api.put<{ success: boolean; data: ReleaseComponent }>(`/core/release/components/${id}`, data),
  deleteComponent: (id: string) => api.delete<{ success: boolean }>(`/core/release/components/${id}`),
  
  // Dependencies
  listDependencies: (releaseId: string) => api.get<{ success: boolean; data: ReleaseDependency[] }>(`/core/release/releases/${releaseId}/dependencies`),
  getDependency: (id: string) => api.get<{ success: boolean; data: ReleaseDependency }>(`/core/release/dependencies/${id}`),
  createDependency: (releaseId: string, data: Partial<ReleaseDependency>) => api.post<{ success: boolean; data: ReleaseDependency }>(`/core/release/releases/${releaseId}/dependencies`, data),
  updateDependency: (id: string, data: Partial<ReleaseDependency>) => api.put<{ success: boolean; data: ReleaseDependency }>(`/core/release/dependencies/${id}`, data),
  deleteDependency: (id: string) => api.delete<{ success: boolean }>(`/core/release/dependencies/${id}`),
  
  // Approvals
  listApprovals: (releaseId: string) => api.get<{ success: boolean; data: ReleaseApproval[] }>(`/core/release/releases/${releaseId}/approvals`),
  getApproval: (id: string) => api.get<{ success: boolean; data: ReleaseApproval }>(`/core/release/approvals/${id}`),
  createApproval: (releaseId: string, data: Partial<ReleaseApproval>) => api.post<{ success: boolean; data: ReleaseApproval }>(`/core/release/releases/${releaseId}/approvals`, data),
  decideApproval: (id: string, userId: string, decision: string, comment?: string) => api.post<{ success: boolean; data: ReleaseApproval }>(`/core/release/approvals/${id}/decide`, { userId, decision, comment }),
  deleteApproval: (id: string) => api.delete<{ success: boolean }>(`/core/release/approvals/${id}`),
  
  // Deployments
  listDeployments: (releaseId: string) => api.get<{ success: boolean; data: ReleaseDeployment[] }>(`/core/release/releases/${releaseId}/deployments`),
  getDeployment: (id: string) => api.get<{ success: boolean; data: ReleaseDeployment }>(`/core/release/deployments/${id}`),
  createDeployment: (releaseId: string, data: Partial<ReleaseDeployment>) => api.post<{ success: boolean; data: ReleaseDeployment }>(`/core/release/releases/${releaseId}/deployments`, data),
  updateDeployment: (id: string, data: Partial<ReleaseDeployment>) => api.put<{ success: boolean; data: ReleaseDeployment }>(`/core/release/deployments/${id}`, data),
  deleteDeployment: (id: string) => api.delete<{ success: boolean }>(`/core/release/deployments/${id}`),
  startDeployment: (id: string) => api.post<{ success: boolean; data: ReleaseDeployment }>(`/core/release/deployments/${id}/start`),
  completeDeployment: (id: string) => api.post<{ success: boolean; data: ReleaseDeployment }>(`/core/release/deployments/${id}/complete`),
  rollbackDeployment: (id: string, reason: string) => api.post<{ success: boolean; data: ReleaseDeployment }>(`/core/release/deployments/${id}/rollback`, { reason }),
  
  // Change Association
  associateChange: (releaseId: string, changeId: string) => api.post<{ success: boolean; data: unknown }>(`/core/release/releases/${releaseId}/changes`, { changeId }),
  removeChange: (releaseId: string, changeId: string) => api.delete<{ success: boolean }>(`/core/release/releases/${releaseId}/changes/${changeId}`),
  
  // Dashboard
  getDashboard: () => api.get<{ success: boolean; data: ReleaseDashboard }>(`/core/release/dashboard`),
};

export default releaseApi;
