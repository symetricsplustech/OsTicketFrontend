import api from '@shared/lib/api';

export interface ImprovementOpportunity {
  _id: string; tenantId: string; number: string; title: string; description: string;
  source: string; category: string; priority: string; status: string;
  impact: string; effort: string; risk: string;
  submittedBy: string; assignedTo: string; qualifiedBy: string; qualifiedAt: string;
  approvedBy: string; approvedAt: string; initiativeId: string;
  createdAt: string; updatedAt: string;
}

export interface ImprovementInitiative {
  _id: string; tenantId: string; number: string; title: string; description: string;
  opportunityId: string; status: string; priority: string; type: string;
  startDate: string; endDate: string; plannedStartDate: string; plannedEndDate: string;
  actualStartDate: string; actualEndDate: string;
  sponsorId: string; ownerId: string; teamId: string;
  budget: number; currency: string; actualCost: number;
  baselineMetrics: Array<{ metricName: string; baselineValue: number; unit: string; measuredAt: string; source: string }>;
  targetMetrics: Array<{ metricName: string; targetValue: number; unit: string; targetDate: string; currentValue: number; lastMeasuredAt: string }>;
  benefits: Array<{ name: string; type: string; estimatedValue: number; actualValue: number; unit: string; realizationDate: string }>;
  costs: Array<{ category: string; plannedAmount: number; actualAmount: number; currency: string; incurredAt: string }>;
  risks: Array<{ description: string; probability: string; impact: string; mitigation: string; ownerId: string }>;
  createdAt: string; updatedAt: string;
}

export interface ImprovementTask {
  _id: string; tenantId: string; initiativeId: string; goalId: string; number: string;
  title: string; description: string; type: string; status: string; priority: string;
  assigneeId: string; startDate: string; endDate: string; plannedStartDate: string; plannedEndDate: string;
  actualStartDate: string; actualEndDate: string; estimatedDuration: number; actualDuration: number;
  dependencies: Array<{ taskId: string; type: string }>;
  deliverables: Array<{ name: string; description: string; status: string; dueDate: string; completedAt: string }>;
  notes: string; createdAt: string; updatedAt: string;
}

export interface ImprovementGoal {
  _id: string; tenantId: string; initiativeId: string; number: string; title: string; description: string;
  metricName: string; metricUnit: string; baselineValue: number; targetValue: number; currentValue: number;
  targetDate: string; achievedDate: string; status: string; direction: string;
  threshold: { warning: number; critical: number };
  measurementFrequency: string; lastMeasuredAt: string; lastMeasuredBy: string; measurementSource: string;
  createdAt: string; updatedAt: string;
}

export interface Benefit {
  _id: string; tenantId: string; initiativeId: string; number: string; name: string; description: string;
  type: string; estimatedValue: number; actualValue: number; unit: string; currency: string;
  realizationDate: string; isRecurring: boolean; recurringPeriod: string;
  status: string; validatedBy: string; validatedAt: string;
  createdAt: string; updatedAt: string;
}

export interface Cost {
  _id: string; tenantId: string; initiativeId: string; number: string; category: string;
  description: string; plannedAmount: number; actualAmount: number; currency: string;
  incurredAt: string; paidAt: string; status: string; vendor: string; invoiceNumber: string;
  approvedBy: string; approvedAt: string; isRecurring: boolean; recurringPeriod: string;
  createdAt: string; updatedAt: string;
}

export interface MetricBaseline {
  _id: string; tenantId: string; initiativeId: string; goalId: string; number: string;
  metricName: string; metricCategory: string; metricUnit: string;
  baselineValue: number; baselineDate: string; measurementMethod: string; dataSource: string;
  sampleSize: number; confidenceLevel: number; isActive: boolean;
  validFrom: string; validUntil: string; approvedBy: string; approvedAt: string;
  createdAt: string; updatedAt: string;
}

export interface MetricTarget {
  _id: string; tenantId: string; initiativeId: string; goalId: string; number: string;
  metricName: string; metricCategory: string; metricUnit: string;
  targetValue: number; currentValue: number; targetDate: string; baselineId: string;
  baselineValue: number; improvementPercentage: number; measurementFrequency: string;
  lastMeasuredAt: string; lastMeasuredBy: string; dataSource: string;
  status: string; achievedAt: string; trend: string;
  createdAt: string; updatedAt: string;
}

export interface ImprovementDashboard {
  totalOpportunities: number; opportunitiesByStatus: Record<string, number>;
  totalInitiatives: number; initiativesByStatus: Record<string, number>;
  totalTasks: number; tasksByStatus: Record<string, number>;
  totalGoals: number; goalsByStatus: Record<string, number>;
  totalBenefits: number; estimatedBenefits: number; actualBenefits: number;
  totalCosts: number; plannedCosts: number; actualCosts: number; roi: number;
  totalBaselines: number; activeTargets: number;
  achievedGoals: number; atRiskGoals: number; achievedTargets: number; atRiskTargets: number;
  roiPositive: boolean;
}

export const improvementApi = {
  // Opportunities
  listOpportunities: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ImprovementOpportunity[] }>('/core/improvement/opportunities', { params }),
  getOpportunity: (id: string) => api.get<{ success: boolean; data: ImprovementOpportunity }>(`/core/improvement/opportunities/${id}`),
  createOpportunity: (data: Partial<ImprovementOpportunity>) => api.post<{ success: boolean; data: ImprovementOpportunity }>('/core/improvement/opportunities', data),
  updateOpportunity: (id: string, data: Partial<ImprovementOpportunity>) => api.put<{ success: boolean; data: ImprovementOpportunity }>(`/core/improvement/opportunities/${id}`, data),
  transitionOpportunity: (id: string, status: string) => api.post<{ success: boolean; data: unknown }>(`/core/improvement/opportunities/${id}/transition`, { status }),
  deleteOpportunity: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/opportunities/${id}`),

  // Initiatives
  listInitiatives: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/initiatives', { params }),
  getInitiative: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/initiatives/${id}`),
  getInitiativeDetail: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/initiatives/${id}/detail`),
  createInitiative: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/initiatives', data),
  updateInitiative: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/initiatives/${id}`, data),
  transitionInitiative: (id: string, status: string) => api.post<{ success: boolean; data: unknown }>(`/core/improvement/initiatives/${id}/transition`, { status }),
  deleteInitiative: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/initiatives/${id}`),

  // Tasks
  listTasks: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/tasks', { params }),
  getTask: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/tasks/${id}`),
  createTask: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/tasks', data),
  updateTask: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/tasks/${id}`, data),
  transitionTask: (id: string, status: string) => api.post<{ success: boolean; data: unknown }>(`/core/improvement/tasks/${id}/transition`, { status }),
  deleteTask: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/tasks/${id}`),

  // Goals
  listGoals: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/goals', { params }),
  getGoal: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/goals/${id}`),
  createGoal: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/goals', data),
  updateGoal: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/goals/${id}`, data),
  updateGoalProgress: (id: string, currentValue: number) => api.post<{ success: boolean; data: unknown }>(`/core/improvement/goals/${id}/progress`, { currentValue }),
  deleteGoal: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/goals/${id}`),

  // Benefits
  listBenefits: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/benefits', { params }),
  createBenefit: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/benefits', data),
  updateBenefit: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/benefits/${id}`, data),
  deleteBenefit: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/benefits/${id}`),

  // Costs
  listCosts: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/costs', { params }),
  createCost: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/costs', data),
  updateCost: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/costs/${id}`, data),
  deleteCost: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/costs/${id}`),

  // Baselines
  listBaselines: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/baselines', { params }),
  createBaseline: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/baselines', data),
  updateBaseline: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/baselines/${id}`, data),
  deleteBaseline: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/baselines/${id}`),

  // Targets
  listTargets: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: unknown[] }>('/core/improvement/targets', { params }),
  getTarget: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/targets/${id}`),
  createTarget: (data: Partial<unknown>) => api.post<{ success: boolean; data: unknown }>('/core/improvement/targets', data),
  updateTarget: (id: string, data: Partial<unknown>) => api.put<{ success: boolean; data: unknown }>(`/core/improvement/targets/${id}`, data),
  deleteTarget: (id: string) => api.delete<{ success: boolean }>(`/core/improvement/targets/${id}`),

  // Dashboard / ROI
  getDashboard: () => api.get<{ success: boolean; data: ImprovementDashboard }>('/core/improvement/dashboard'),
  getInitiativeROI: (id: string) => api.get<{ success: boolean; data: unknown }>(`/core/improvement/initiatives/${id}/roi`),
};

export default improvementApi;
