import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export const platformApi = createApi({
  reducerPath: 'platformApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    // Modules
    'Modules', 'ModuleHistory',
    // Notification preferences
    'NotificationPrefs',
    // Compliance
    'RetentionPolicy', 'Dsar', 'Classification', 'FieldMasking', 'IpAllowlist', 'PasswordPolicy', 'BackupTest',
    // Usage & billing
    'Usage', 'Invoice',
    // CRM
    'Campaign', 'Territory', 'AccountTeam', 'StageAgeing', 'SalesPipeline', 'Opportunity', 'Quote', 'LeadCapture',
    // ITOM
    'RemediationAction', 'RemediationExecution', 'CloudAccount', 'CloudCost', 'SoarPlaybook', 'ThreatFeed', 'DiscoverySchedule',
    // SPM
    'Okr', 'Sprint', 'RateCard',
    // FSM
    'Contractor', 'ContractorAssignment', 'DispatcherBoard', 'WorkOrder',
    // Governance
    'RegulatoryChange', 'ClauseItem',
    // ITAM
    'SoftwareImport', 'Reclamation', 'SaaSRoster', 'AssetAuditRun', 'StockroomBin', 'SoftwareGovernance', 'VendorPack',
    // Helpdesk
    'Worklog', 'Draft', 'PriorityMatrix', 'HandoverNote', 'KnowledgeBase', 'MttMetrics',
    // Integrations
    'Connector', 'IntegrationLog', 'InboundMessage', 'ImportBatch', 'ErpConnection', 'KnowledgeGraphLite',
    // ESG
    'EsgDisclosure', 'SupplierEsg', 'EsgInitiative',
    // Shell
    'Notification', 'SearchResult', 'Approval',
    // Gaps2
    'CommunityThread', 'UnifiedInbox', 'ManagerHub', 'FloorPlan', 'Occupancy', 'Storefront', 'Event', 'AclRule', 'RoadmapItem', 'Employee', 'Branding', 'Maintenance',
    // Gaps3
    'Organization', 'OidcConfig', 'AuthorityDoc', 'GrcQuestionnaire', 'PrivacyAssessment', 'CrisisEvent', 'Sensor', 'PatchCampaign', 'SecOpsFinding', 'SavedPage', 'Attachment', 'DecisionTable', 'OcInvoice',
    // Super Admin
    'SaDashboard', 'SaTenant', 'SaPlan', 'SaAudit', 'SaNotification', 'SaAdmin', 'SaModule', 'SaOperations', 'SaSecurity',
    // Legacy (kept for backward compat)
    'Crud', 'Related', 'CabMinute', 'FiveWhys',
  ],
  endpoints: () => ({}),
});

export const withTenantError = (error: unknown): string => {
  const e = error as { data?: { error?: string; message?: string }; status?: number };
  return e?.data?.error || e?.data?.message || (e?.status === 403 ? 'Not permitted for your role' : 'Request failed');
};
