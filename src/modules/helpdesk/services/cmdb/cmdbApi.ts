import api from '@shared/lib/api';

export interface ServicePortfolio {
  _id: string; tenantId: string; number: string; name: string; description: string;
  status: string; ownerId: string; ownerGroupId: string;
  governance: { requiresApproval: boolean; approvalGroupId: string; reviewFrequencyDays: number; lastReviewedAt: string; nextReviewAt: string };
  createdAt: string; updatedAt: string;
}

export interface BusinessService {
  _id: string; tenantId: string; portfolioId: string; number: string; name: string; description: string;
  category: string; criticality: string; status: string;
  ownerId: string; ownerGroupId: string; supportGroupId: string;
  availabilityTarget: number; availabilityTargetUnit: string;
  operatingHours: { timezone: string; schedule: string; exceptions: Array<{ date: string; description: string }> };
  serviceLevelCommitments: string[]; createdAt: string; updatedAt: string;
}

export interface TechnicalService {
  _id: string; tenantId: string; businessServiceId: string; number: string; name: string; description: string;
  type: string; status: string; environment: string;
  technologyStack: Array<{ name: string; version: string; vendor: string }>;
  hostingLocation: string; ownerId: string; ownerGroupId: string; supportedBy: string[];
  dependencies: Array<{ serviceId: string; dependencyType: string }>;
  createdAt: string; updatedAt: string;
}

export interface ServiceOffering {
  _id: string; tenantId: string; businessServiceId: string; number: string; name: string; description: string;
  type: string; status: string; category: string;
  pricing: { model: string; basePrice: number; currency: string; tiers: Array<{ name: string; price: number; limits: unknown }> };
  fulfillment: { requiresApproval: boolean; approvalGroupId: string; fulfillmentPlanId: string; estimatedDeliveryDays: number };
  slaCommitments: string[]; catalogItemId: string;
  createdAt: string; updatedAt: string;
}

export interface ConfigurationItem {
  _id: string; tenantId: string; number: string; name: string; description: string;
  ciClass: string; ciSubclass: string; environment: string; criticality: string;
  status: string; lifecycleState: string;
  manufacturer: string; model: string; serialNumber: string; assetTag: string;
  ipAddress: string; macAddress: string; hostname: string;
  operatingSystem: string; version: string; location: string; rack: string; dataCenter: string;
  ownerId: string; ownerGroupId: string; supportGroupId: string;
  businessServices: string[]; technicalServices: string[]; serviceOfferings: string[];
  attributes: Record<string, unknown>; customFields: Record<string, unknown>;
  lastScannedAt: string; lastCertifiedAt: string; certifiedBy: string;
  createdAt: string; updatedAt: string;
}

export interface CIRelationship {
  _id: string; tenantId: string; sourceCIId: string; targetCIId: string;
  relationshipType: string; direction: string; strength: string; isActive: boolean; description: string;
  createdAt: string; updatedAt: string;
}

export interface ServiceOwner {
  _id: string; tenantId: string; serviceId: string; userId: { _id: string; name: string; email: string } | string;
  role: string; isPrimary: boolean; assignedAt: string; responsibilities: string[];
  escalationContact: boolean; createdAt: string;
}

export interface ServiceCommitment {
  _id: string; tenantId: string; serviceId: string; offeringId: string;
  name: string; description: string; type: string;
  targetValue: number; targetUnit: string; measurementWindow: string;
  calculationMethod: string; threshold: { warning: number; critical: number; breach: number };
  reportingFrequency: string; status: string; startDate: string; endDate: string;
  penalty: string; createdAt: string; updatedAt: string;
}

export interface ServiceLevelCommitment {
  _id: string; tenantId: string; number: string; name: string; description: string;
  type: string; scope: string; targetValue: number; targetUnit: string;
  measurementWindow: string; businessHoursOnly: boolean; scheduleId: string; escalationPolicyId: string;
  penalty: string; status: string; startDate: string; endDate: string;
  createdAt: string; updatedAt: string;
}

export interface Dependency {
  _id: string; tenantId: string; number: string; name: string; description: string;
  sourceType: string; sourceId: string; targetType: string; targetId: string;
  dependencyType: string; criticality: string; impactType: string;
  isActive: boolean; isBidirectional: boolean; autoDiscovered: boolean;
  discoverySource: string; validationStatus: string; lastValidatedAt: string;
  createdAt: string; updatedAt: string;
}

export interface ImpactAnalysisResult {
  sourceCI: ConfigurationItem;
  impacted: Array<{ ci: ConfigurationItem; relationship: CIRelationship; depth: number; path: string[] }>;
  totalImpacted: number;
}

export interface ServiceImpactResult {
  service: BusinessService;
  cis: ConfigurationItem[];
  impacts: Array<{ ci: ConfigurationItem; impact: ImpactAnalysisResult }>;
  dependencies: Dependency[];
}

export interface DependencyGraph {
  nodes: Array<{ id: string; label: string; ciClass: string; criticality: string; status: string; environment: string; depth: number }>;
  edges: Array<{ from: string; to: string; relationshipType: string; direction: string; strength: string }>;
}

export interface CmdbDashboard {
  portfolios: number; activePortfolios: number;
  businessServices: number; activeBusinessServices: number;
  technicalServices: number; activeTechnicalServices: number;
  offerings: number; activeOfferings: number;
  cis: number;
  ciStatusBreakdown: Record<string, number>;
  ciCriticalityBreakdown: Record<string, number>;
  ciEnvironmentBreakdown: Record<string, number>;
  relationships: number; dependencies: number;
  avgRelationshipsPerCI: number;
  staleCIs: number; uncertifiedCIs: number; noOwnerCIs: number;
  healthScore: number;
}

export const cmdbApi = {
  // Service Portfolio
  listPortfolios: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ServicePortfolio[] }>('/core/cmdb/portfolios', { params }),
  getPortfolio: (id: string) => api.get<{ success: boolean; data: ServicePortfolio }>(`/core/cmdb/portfolios/${id}`),
  createPortfolio: (data: Partial<ServicePortfolio>) => api.post<{ success: boolean; data: ServicePortfolio }>('/core/cmdb/portfolios', data),
  updatePortfolio: (id: string, data: Partial<ServicePortfolio>) => api.put<{ success: boolean; data: ServicePortfolio }>(`/core/cmdb/portfolios/${id}`, data),
  deletePortfolio: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/portfolios/${id}`),

  // Business Services
  listBusinessServices: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: BusinessService[] }>('/core/cmdb/business-services', { params }),
  getBusinessService: (id: string) => api.get<{ success: boolean; data: BusinessService }>(`/core/cmdb/business-services/${id}`),
  createBusinessService: (data: Partial<BusinessService>) => api.post<{ success: boolean; data: BusinessService }>('/core/cmdb/business-services', data),
  updateBusinessService: (id: string, data: Partial<BusinessService>) => api.put<{ success: boolean; data: BusinessService }>(`/core/cmdb/business-services/${id}`, data),
  deleteBusinessService: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/business-services/${id}`),

  // Technical Services
  listTechnicalServices: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: TechnicalService[] }>('/core/cmdb/technical-services', { params }),
  getTechnicalService: (id: string) => api.get<{ success: boolean; data: TechnicalService }>(`/core/cmdb/technical-services/${id}`),
  createTechnicalService: (data: Partial<TechnicalService>) => api.post<{ success: boolean; data: TechnicalService }>('/core/cmdb/technical-services', data),
  updateTechnicalService: (id: string, data: Partial<TechnicalService>) => api.put<{ success: boolean; data: TechnicalService }>(`/core/cmdb/technical-services/${id}`, data),
  deleteTechnicalService: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/technical-services/${id}`),

  // Service Offerings
  listServiceOfferings: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ServiceOffering[] }>('/core/cmdb/service-offerings', { params }),
  getServiceOffering: (id: string) => api.get<{ success: boolean; data: ServiceOffering }>(`/core/cmdb/service-offerings/${id}`),
  createServiceOffering: (data: Partial<ServiceOffering>) => api.post<{ success: boolean; data: ServiceOffering }>('/core/cmdb/service-offerings', data),
  updateServiceOffering: (id: string, data: Partial<ServiceOffering>) => api.put<{ success: boolean; data: ServiceOffering }>(`/core/cmdb/service-offerings/${id}`, data),
  deleteServiceOffering: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/service-offerings/${id}`),

  // Configuration Items
  listCIs: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ConfigurationItem[] }>('/core/cmdb/cis', { params }),
  searchCIs: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ConfigurationItem[] }>('/core/cmdb/cis/search', { params }),
  getCI: (id: string) => api.get<{ success: boolean; data: ConfigurationItem }>(`/core/cmdb/cis/${id}`),
  createCI: (data: Partial<ConfigurationItem>) => api.post<{ success: boolean; data: ConfigurationItem }>('/core/cmdb/cis', data),
  updateCI: (id: string, data: Partial<ConfigurationItem>) => api.put<{ success: boolean; data: ConfigurationItem }>(`/core/cmdb/cis/${id}`, data),
  deleteCI: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/cis/${id}`),

  // CI Relationships
  listRelationships: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: CIRelationship[] }>('/core/cmdb/relationships', { params }),
  getRelationship: (id: string) => api.get<{ success: boolean; data: CIRelationship }>(`/core/cmdb/relationships/${id}`),
  createRelationship: (data: Partial<CIRelationship>) => api.post<{ success: boolean; data: CIRelationship }>(`/core/cmdb/relationships`, data),
  updateRelationship: (id: string, data: Partial<CIRelationship>) => api.put<{ success: boolean; data: CIRelationship }>(`/core/cmdb/relationships/${id}`, data),
  deleteRelationship: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/relationships/${id}`),

  // Service Owners
  listServiceOwners: (serviceId: string) => api.get<{ success: boolean; data: ServiceOwner[] }>(`/core/cmdb/business-services/${serviceId}/owners`),
  assignServiceOwner: (serviceId: string, data: Partial<ServiceOwner>) => api.post<{ success: boolean; data: ServiceOwner }>(`/core/cmdb/business-services/${serviceId}/owners`, data),
  removeServiceOwner: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/owners/${id}`),

  // Service Commitments
  listServiceCommitments: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ServiceCommitment[] }>(`/core/cmdb/commitments`, { params }),
  getServiceCommitment: (id: string) => api.get<{ success: boolean; data: ServiceCommitment }>(`/core/cmdb/commitments/${id}`),
  createServiceCommitment: (data: Partial<ServiceCommitment>) => api.post<{ success: boolean; data: ServiceCommitment }>(`/core/cmdb/commitments`, data),
  updateServiceCommitment: (id: string, data: Partial<ServiceCommitment>) => api.put<{ success: boolean; data: ServiceCommitment }>(`/core/cmdb/commitments/${id}`, data),
  deleteServiceCommitment: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/commitments/${id}`),

  // Service Level Commitments
  listSLCs: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: ServiceLevelCommitment[] }>(`/core/cmdb/slcs`, { params }),
  getSLC: (id: string) => api.get<{ success: boolean; data: ServiceLevelCommitment }>(`/core/cmdb/slcs/${id}`),
  createSLC: (data: Partial<ServiceLevelCommitment>) => api.post<{ success: boolean; data: ServiceLevelCommitment }>(`/core/cmdb/slcs`, data),
  updateSLC: (id: string, data: Partial<ServiceLevelCommitment>) => api.put<{ success: boolean; data: ServiceLevelCommitment }>(`/core/cmdb/slcs/${id}`, data),
  deleteSLC: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/slcs/${id}`),

  // Dependencies
  listDependencies: (params?: Record<string, unknown>) => api.get<{ success: boolean; data: Dependency[] }>(`/core/cmdb/dependencies`, { params }),
  getDependency: (id: string) => api.get<{ success: boolean; data: Dependency }>(`/core/cmdb/dependencies/${id}`),
  createDependency: (data: Partial<Dependency>) => api.post<{ success: boolean; data: Dependency }>(`/core/cmdb/dependencies`, data),
  updateDependency: (id: string, data: Partial<Dependency>) => api.put<{ success: boolean; data: Dependency }>(`/core/cmdb/dependencies/${id}`, data),
  deleteDependency: (id: string) => api.delete<{ success: boolean }>(`/core/cmdb/dependencies/${id}`),

  // Impact Analysis
  analyzeImpact: (ciId: string, options?: Record<string, unknown>) => api.post<{ success: boolean; data: ImpactAnalysisResult }>(`/core/cmdb/impact/ci/${ciId}`, options),
  analyzeServiceImpact: (serviceId: string) => api.get<{ success: boolean; data: ServiceImpactResult }>(`/core/cmdb/impact/service/${serviceId}`),
  getDependencyGraph: (options?: Record<string, unknown>) => api.post<{ success: boolean; data: DependencyGraph }>(`/core/cmdb/dependency-graph`, options),

  // Dashboard / Search / Compliance
  getDashboard: () => api.get<{ success: boolean; data: CmdbDashboard }>(`/core/cmdb/dashboard`),
};

export default cmdbApi;
