import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@shared/store/store';
import { useAuth } from '@core/auth/useAuth';
import { useAppDispatch } from '@shared/store/hooks';
import { hydrateThunk } from '@shared/store/authSlice';
import Layout from '@core/layout/Layout';
import { ModuleGuard } from '@core/permissions/ModuleGuard';

// Auth
const Login = lazy(() => import('@core/auth/Login'));
const Register = lazy(() => import('@core/auth/Register'));

// Help Desk
const Dashboard = lazy(() => import('@modules/helpdesk/pages/Dashboard'));
const TicketList = lazy(() => import('@modules/helpdesk/pages/TicketList'));
const NewTicket = lazy(() => import('@modules/helpdesk/pages/NewTicket'));
const TicketDetail = lazy(() => import('@modules/helpdesk/pages/TicketDetail'));
const Incidents = lazy(() => import('@modules/helpdesk/pages/Incidents'));
const Problems = lazy(() => import('@modules/helpdesk/pages/Problems'));
const Changes = lazy(() => import('@modules/helpdesk/pages/Changes'));
const KnowledgeBase = lazy(() => import('@modules/helpdesk/pages/KnowledgeBase'));
const ServiceCatalog = lazy(() => import('@modules/helpdesk/pages/ServiceCatalog'));
const Assets = lazy(() => import('@modules/helpdesk/pages/Assets'));
const AssetDetail = lazy(() => import('@modules/helpdesk/pages/AssetDetail'));

// CRM
const LeadList = lazy(() => import('@modules/crm/pages/LeadList'));
const LeadDetail = lazy(() => import('@modules/crm/pages/LeadDetail'));
const AccountList = lazy(() => import('@modules/crm/pages/AccountList'));
const AccountDetail = lazy(() => import('@modules/crm/pages/AccountDetail'));
const ContactList = lazy(() => import('@modules/crm/pages/ContactList'));
const OpportunityList = lazy(() => import('@modules/crm/pages/OpportunityList'));
const Pipeline = lazy(() => import('@modules/crm/pages/Pipeline'));
const QuoteList = lazy(() => import('@modules/crm/pages/QuoteList'));

// ITOM
const ResourceRegistry = lazy(() => import('@modules/itom/pages/ResourceRegistry'));
const AlertDashboard = lazy(() => import('@modules/itom/pages/AlertDashboard'));

// Projects
const ProjectList = lazy(() => import('@modules/projects/pages/ProjectList'));

// HR
const HrDashboard = lazy(() => import('@modules/hr/pages/HrDashboard'));

// Field Service
const WorkOrderList = lazy(() => import('@modules/fieldservice/pages/WorkOrderList'));

// Settings
const Settings = lazy(() => import('@modules/settings/pages/Settings'));
const Users = lazy(() => import('@modules/settings/pages/Users'));
const TenantOnboarding = lazy(() => import('@modules/settings/pages/Onboarding'));
const Teams = lazy(() => import('@modules/settings/pages/Teams'));
const Roles = lazy(() => import('@modules/settings/pages/Roles'));
const AccessControl = lazy(() => import('@modules/settings/pages/AccessControl'));
const OrganizationUnits = lazy(() => import('@modules/settings/pages/OrganizationUnits'));
const Departments = lazy(() => import('@modules/settings/pages/Departments'));
const SlaPlans = lazy(() => import('@modules/settings/pages/SlaPlans'));
const EmailSettings = lazy(() => import('@modules/settings/pages/EmailSettings'));
const Integrations = lazy(() => import('@modules/settings/pages/Integrations'));
const AuditLogs = lazy(() => import('@modules/settings/pages/AuditLogs'));

// Workflow
const WorkflowList = lazy(() => import('@modules/workflow/pages/WorkflowList'));
const WorkflowDetail = lazy(() => import('@modules/workflow/pages/WorkflowDetail'));
const WorkflowLogs = lazy(() => import('@modules/workflow/pages/WorkflowLogs'));

// Analytics
const Reports = lazy(() => import('@modules/analytics/pages/Reports'));
const AnalyticsDashboard = lazy(() => import('@modules/analytics/pages/Dashboard'));
const ScheduledReports = lazy(() => import('@modules/analytics/pages/ScheduledReports'));

// ITAM (new)
const LicenseManagement = lazy(() => import('@modules/itam/pages/LicenseManagement'));
const InventoryManagement = lazy(() => import('@modules/itam/pages/InventoryManagement'));

// CSM
const CustomerServicePortal = lazy(() => import('@modules/csm/pages/CustomerServicePortal'));

// Settings (new)
const FeatureFlagsPage = lazy(() => import('@modules/settings/pages/FeatureFlags'));
const InvitationsPage = lazy(() => import('@modules/settings/pages/Invitations'));

// Help Desk (new)
const IncidentPlaybooks = lazy(() => import('@modules/helpdesk/pages/IncidentPlaybooks'));
const OnCallSchedules = lazy(() => import('@modules/helpdesk/pages/OnCallSchedules'));
const TicketTemplates = lazy(() => import('@modules/helpdesk/pages/TicketTemplates'));
const OutageTracking = lazy(() => import('@modules/helpdesk/pages/OutageTracking'));
const TicketBoard = lazy(() => import('@modules/helpdesk/pages/TicketBoard'));

// ITOM (ops)
const OpsTools = lazy(() => import('@modules/itom/pages/OpsTools'));
const ServiceMap = lazy(() => import('@modules/itom/pages/ServiceMap'));

// Projects (ops)
const GanttChart = lazy(() => import('@modules/projects/pages/GanttChart'));
const ProjectKanban = lazy(() => import('@modules/projects/pages/ProjectKanban'));
const Portfolio = lazy(() => import('@modules/projects/pages/Portfolio'));

// HR / CSM / Field Service
const EmployeePortal = lazy(() => import('@modules/hr/pages/EmployeePortal'));
const PartnerPortal = lazy(() => import('@modules/csm/pages/PartnerPortal'));
const TechnicianAvailability = lazy(() => import('@modules/fieldservice/pages/TechnicianAvailability'));

// Settings (integrations)
const IntegrationsConfig = lazy(() => import('@modules/settings/pages/IntegrationsConfig'));
const Delegations = lazy(() => import('@modules/settings/pages/Delegations'));
const HrAccessControl = lazy(() => import('@modules/settings/pages/HrAccessControl'));

// Final 9 features
const ESignatures = lazy(() => import('@modules/crm/pages/ESignatures'));
const AssetLabels = lazy(() => import('@modules/itam/pages/AssetLabels'));
const ProhibitedSoftware = lazy(() => import('@modules/itam/pages/ProhibitedSoftware'));
const DrillDownReport = lazy(() => import('@modules/analytics/pages/DrillDownReport'));
const ChangeCalendarPage = lazy(() => import('@modules/helpdesk/pages/ChangeCalendarPage'));
const PostImplReviews = lazy(() => import('@modules/helpdesk/pages/PostImplReviews'));
const ChartBuilder = lazy(() => import('@modules/analytics/pages/ChartBuilder'));
const ResourceAllocation = lazy(() => import('@modules/projects/pages/ResourceAllocation'));
const WarRoom = lazy(() => import('@modules/helpdesk/pages/WarRoom'));
const IncidentDiagnosis = lazy(() => import('@modules/helpdesk/pages/IncidentDiagnosis'));
const WorkflowDesigner = lazy(() => import('@modules/workflow/pages/WorkflowDesigner'));

// Enterprise expansion modules
const CmdbExplorer = lazy(() => import('@modules/cmdb/pages/CmdbExplorer'));
const SecurityOps = lazy(() => import('@modules/secops/pages/SecurityOps'));
const GrcConsole = lazy(() => import('@modules/grc/pages/GrcConsole'));
const WorkplaceConsole = lazy(() => import('@modules/workplace/pages/WorkplaceConsole'));
const LegalConsole = lazy(() => import('@modules/legal/pages/LegalConsole'));
const ProcurementConsole = lazy(() => import('@modules/procurement/pages/ProcurementConsole'));
const FinanceConsole = lazy(() => import('@modules/finance/pages/FinanceConsole'));
const EsgConsole = lazy(() => import('@modules/esg/pages/EsgConsole'));
const ModulesManager = lazy(() => import('@modules/settings/pages/ModulesManager'));
const BillingPortal = lazy(() => import('@modules/settings/pages/BillingPortal'));
const NotificationPrefs = lazy(() => import('@modules/settings/pages/NotificationPrefs'));
const ComplianceCenter = lazy(() => import('@modules/settings/pages/ComplianceCenter'));
const OpsGovernance = lazy(() => import('@modules/itom/pages/OpsGovernance'));
const GrowthTools = lazy(() => import('@modules/crm/pages/GrowthTools'));
const PlanningExtras = lazy(() => import('@modules/projects/pages/PlanningExtras'));
const SoftwareGovernance = lazy(() => import('@modules/itam/pages/SoftwareGovernance'));
const Communities = lazy(() => import('@modules/csm/pages/Communities'));
const UnifiedInbox = lazy(() => import('@modules/csm/pages/UnifiedInbox'));
const ShiftHandover = lazy(() => import('@modules/helpdesk/pages/ShiftHandover'));
const ManagerHub = lazy(() => import('@modules/hr/pages/ManagerHub'));
const FloorPlanViewer = lazy(() => import('@modules/workplace/pages/FloorPlanViewer'));
const ClauseLibrary = lazy(() => import('@modules/legal/pages/ClauseLibrary'));
const Storefront = lazy(() => import('@modules/procurement/pages/Storefront'));
const AuditScanner = lazy(() => import('@modules/itam/pages/AuditScanner'));
const OrgSwitcher = lazy(() => import('@modules/settings/pages/OrgSwitcher'));
const PlatformAdmin = lazy(() => import('@modules/settings/pages/PlatformAdmin'));

// Super Admin
const SuperAdminDashboard = lazy(() => import('@modules/superadmin/pages/SuperAdminDashboard'));
const SuperAdminTenantList = lazy(() => import('@modules/superadmin/pages/SuperAdminTenantList'));
const SuperAdminTenantDetail = lazy(() => import('@modules/superadmin/pages/SuperAdminTenantDetail'));
const SuperAdminTenantCreate = lazy(() => import('@modules/superadmin/pages/SuperAdminTenantCreate'));
const SuperAdminPlans = lazy(() => import('@modules/superadmin/pages/SuperAdminPlans'));
const SuperAdminAuditLogs = lazy(() => import('@modules/superadmin/pages/SuperAdminAuditLogs'));
const SuperAdminAdmins = lazy(() => import('@modules/superadmin/pages/SuperAdminAdmins'));
const SuperAdminOperations = lazy(() => import('@modules/superadmin/pages/SuperAdminOperations'));
const SuperAdminModules = lazy(() => import('@modules/superadmin/pages/SuperAdminModules'));
const SuperAdminSecurity = lazy(() => import('@modules/superadmin/pages/SuperAdminSecurity'));
const SuperAdminSettings = lazy(() => import('@modules/superadmin/pages/SuperAdminSettings'));
const PriorityMatrixEditor = lazy(() => import('@modules/helpdesk/pages/PriorityMatrixEditor'));
const LeadCapture = lazy(() => import('@modules/crm/pages/LeadCapture'));
const SalesPipelines = lazy(() => import('@modules/crm/pages/SalesPipelines'));
const QuoteVersions = lazy(() => import('@modules/crm/pages/QuoteVersions'));
const DispatcherBoard = lazy(() => import('@modules/fsm/pages/DispatcherBoard'));
const VulnOps = lazy(() => import('@modules/secops/pages/VulnOps'));
const GovernanceExtras = lazy(() => import('@modules/grc/pages/GovernanceExtras'));
const AdvancedViews = lazy(() => import('@modules/analytics/pages/AdvancedViews'));
const DocTemplatesHr = lazy(() => import('@modules/hr/pages/DocTemplates'));
const SpendAnalytics = lazy(() => import('@modules/procurement/pages/SpendAnalytics'));
const SocialReplyConsole = lazy(() => import('@modules/csm/pages/SocialReplyConsole'));
const VendorPackView = lazy(() => import('@modules/itam/pages/VendorPackView'));
const KnowledgeInsights = lazy(() => import('@modules/helpdesk/pages/KnowledgeInsights'));
const DiscoverySchedules = lazy(() => import('@modules/itom/pages/DiscoverySchedules'));
const PatchCampaignsPage = lazy(() => import('@modules/secops/pages/PatchCampaigns'));
const HrPromotions = lazy(() => import('@modules/hr/pages/HrPromotions'));
const ContractorMarketplace = lazy(() => import('@modules/fsm/pages/ContractorMarketplace'));
const OutsideCounsel = lazy(() => import('@modules/legal/pages/OutsideCounsel'));
const ImportWizard = lazy(() => import('@modules/settings/pages/ImportWizard'));
const ApprovalInbox = lazy(() => import('@modules/settings/pages/ApprovalInbox'));
const DecisionTablesPage = lazy(() => import('@modules/workflow/pages/DecisionTables'));
const TicketCrud = lazy(() => import('@modules/helpdesk/pages/TicketCrud'));
const MyWork = lazy(() => import('@modules/helpdesk/pages/MyWork'));
const MajorIncidents = lazy(() => import('@modules/helpdesk/pages/MajorIncidents'));
const CabBoard = lazy(() => import('@modules/helpdesk/pages/CabBoard'));
const KnownErrors = lazy(() => import('@modules/helpdesk/pages/KnownErrors'));
const Escalations = lazy(() => import('@modules/helpdesk/pages/Escalations'));
const SlaMonitor = lazy(() => import('@modules/helpdesk/pages/SlaMonitor'));
const Requests = lazy(() => import('@modules/helpdesk/pages/Requests'));
const AssignmentRouting = lazy(() => import('@modules/helpdesk/pages/AssignmentRouting'));
const CsatDashboard = lazy(() => import('@modules/helpdesk/pages/CsatDashboard'));
const HelpdeskReports = lazy(() => import('@modules/helpdesk/pages/HelpdeskReports'));
const HelpdeskAdmin = lazy(() => import('@modules/helpdesk/pages/HelpdeskAdmin'));
const AuditTrail = lazy(() => import('@modules/helpdesk/pages/AuditTrail'));
const IncidentCrud = lazy(() => import('@modules/helpdesk/pages/IncidentCrud'));
const ProblemCrud = lazy(() => import('@modules/helpdesk/pages/ProblemCrud'));
const ChangeCrud = lazy(() => import('@modules/helpdesk/pages/ChangeCrud'));
const OppCrud = lazy(() => import('@modules/crm/pages/OppCrud'));
const AssetCrud = lazy(() => import('@modules/itam/pages/AssetCrud'));
const CiCrud = lazy(() => import('@modules/cmdb/pages/CiCrud'));
const HrCaseCrud = lazy(() => import('@modules/hr/pages/HrCaseCrud'));
const SecurityIncidentCrud = lazy(() => import('@modules/secops/pages/SecurityIncidentCrud'));
const RiskCrud = lazy(() => import('@modules/grc/pages/RiskCrud'));
const LegalMatterCrud = lazy(() => import('@modules/legal/pages/LegalMatterCrud'));
const FinanceCaseCrud = lazy(() => import('@modules/finance/pages/FinanceCaseCrud'));

// CRM (new)
const PriceBooks = lazy(() => import('@modules/crm/pages/PriceBooks'));
const ActivitySequences = lazy(() => import('@modules/crm/pages/ActivitySequences'));
const Segments = lazy(() => import('@modules/crm/pages/Segments'));
const DuplicateDetection = lazy(() => import('@modules/crm/pages/DuplicateDetection'));
const CrmReports = lazy(() => import('@modules/crm/pages/CrmReports'));

// Projects (new)
const ProjectTemplates = lazy(() => import('@modules/projects/pages/ProjectTemplates'));
const ProjectIssues = lazy(() => import('@modules/projects/pages/ProjectIssues'));
const Timesheets = lazy(() => import('@modules/projects/pages/Timesheets'));
const ProjectRisk = lazy(() => import('@modules/projects/pages/ProjectRisk'));

// HR (new)
const HrRequestCatalogue = lazy(() => import('@modules/hr/pages/HrRequestCatalogue'));
const Onboarding = lazy(() => import('@modules/hr/pages/Onboarding'));
const DocumentRequests = lazy(() => import('@modules/hr/pages/DocumentRequests'));
const PolicyAcknowledgement = lazy(() => import('@modules/hr/pages/PolicyAcknowledgement'));

// Analytics (new)
const ReportBuilder = lazy(() => import('@modules/analytics/pages/ReportBuilder'));
const DashboardBuilder = lazy(() => import('@modules/analytics/pages/DashboardBuilder'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (hasPermission('admin.manage') || hasPermission('access.manage')) return <>{children}</>;
  return <Navigate to="/" replace />;
}

function PlatformRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (hasPermission('platform.manage_tenants') || hasPermission('platform.view_tenants')) return <>{children}</>;
  return <Navigate to="/" replace />;
}

function PermissionRoute({ permission, module, children }: { permission?: string; module?: string; children: React.ReactNode }) {
  const { user, loading, hasPermission, hasModule } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && hasPermission(permission)) return <>{children}</>;
  if (module && hasModule(module)) return <>{children}</>;
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup/modules" element={<Navigate to="/" replace />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route index element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />

          {/* Help Desk */}
          <Route path="tickets/manage" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><TicketCrud /></Suspense></ModuleGuard>} />
          <Route path="incidents-crud" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><IncidentCrud /></Suspense></ModuleGuard>} />
          <Route path="problems-crud" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><ProblemCrud /></Suspense></ModuleGuard>} />
          <Route path="changes-crud" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><ChangeCrud /></Suspense></ModuleGuard>} />
          <Route path="opportunities-crud" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><OppCrud /></Suspense></ModuleGuard>} />
          <Route path="assets-crud" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><AssetCrud /></Suspense></ModuleGuard>} />
          <Route path="ci-crud" element={<ModuleGuard module="cmdb"><Suspense fallback={<LoadingSpinner />}><CiCrud /></Suspense></ModuleGuard>} />
          <Route path="hr-cases-crud" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><HrCaseCrud /></Suspense></ModuleGuard>} />
          <Route path="sec-incidents-crud" element={<ModuleGuard module="secops"><Suspense fallback={<LoadingSpinner />}><SecurityIncidentCrud /></Suspense></ModuleGuard>} />
          <Route path="risks-crud" element={<ModuleGuard module="grc"><Suspense fallback={<LoadingSpinner />}><RiskCrud /></Suspense></ModuleGuard>} />
          <Route path="legal-matters-crud" element={<ModuleGuard module="legal"><Suspense fallback={<LoadingSpinner />}><LegalMatterCrud /></Suspense></ModuleGuard>} />
          <Route path="finance-cases-crud" element={<ModuleGuard module="finance"><Suspense fallback={<LoadingSpinner />}><FinanceCaseCrud /></Suspense></ModuleGuard>} />
          <Route path="tickets" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><TicketList /></Suspense></ModuleGuard>} />
          <Route path="tickets/new" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><NewTicket /></Suspense></ModuleGuard>} />
          <Route path="tickets/:number" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><TicketDetail /></Suspense></ModuleGuard>} />
          <Route path="incidents" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><Incidents /></Suspense></ModuleGuard>} />
          <Route path="problems" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><Problems /></Suspense></ModuleGuard>} />
          <Route path="changes" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><Changes /></Suspense></ModuleGuard>} />
          <Route path="kb" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><KnowledgeBase /></Suspense></ModuleGuard>} />
          <Route path="catalog" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><ServiceCatalog /></Suspense></ModuleGuard>} />

          {/* ITAM */}
          <Route path="assets" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><Assets /></Suspense></ModuleGuard>} />
          <Route path="assets/:id" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><AssetDetail /></Suspense></ModuleGuard>} />

          {/* CRM */}
          <Route path="leads" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><LeadList /></Suspense></ModuleGuard>} />
          <Route path="leads/:id" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><LeadDetail /></Suspense></ModuleGuard>} />
          <Route path="accounts" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><AccountList /></Suspense></ModuleGuard>} />
          <Route path="accounts/:id" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><AccountDetail /></Suspense></ModuleGuard>} />
          <Route path="contacts" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><ContactList /></Suspense></ModuleGuard>} />
          <Route path="opportunities" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><OpportunityList /></Suspense></ModuleGuard>} />
          <Route path="pipeline" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><Pipeline /></Suspense></ModuleGuard>} />
          <Route path="quotes" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><QuoteList /></Suspense></ModuleGuard>} />
          <Route path="price-books" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><PriceBooks /></Suspense></ModuleGuard>} />
          <Route path="sequences" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><ActivitySequences /></Suspense></ModuleGuard>} />
          <Route path="segments" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><Segments /></Suspense></ModuleGuard>} />
          <Route path="duplicates" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><DuplicateDetection /></Suspense></ModuleGuard>} />
          <Route path="crm-reports" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><CrmReports /></Suspense></ModuleGuard>} />
          <Route path="esign" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><ESignatures /></Suspense></ModuleGuard>} />

          {/* ITOM */}
          <Route path="resources" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><ResourceRegistry /></Suspense></ModuleGuard>} />
          <Route path="alerts" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><AlertDashboard /></Suspense></ModuleGuard>} />

          {/* Projects */}
          <Route path="projects" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ProjectList /></Suspense></ModuleGuard>} />
          <Route path="project-templates" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ProjectTemplates /></Suspense></ModuleGuard>} />
          <Route path="project-issues" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ProjectIssues /></Suspense></ModuleGuard>} />
          <Route path="timesheets" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><Timesheets /></Suspense></ModuleGuard>} />
          <Route path="project-risks" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ProjectRisk /></Suspense></ModuleGuard>} />
          <Route path="gantt" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><GanttChart /></Suspense></ModuleGuard>} />
          <Route path="project-board" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ProjectKanban /></Suspense></ModuleGuard>} />
          <Route path="portfolio" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><Portfolio /></Suspense></ModuleGuard>} />
          <Route path="resource-allocation" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><ResourceAllocation /></Suspense></ModuleGuard>} />

          {/* HR */}
          <Route path="hr" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><HrDashboard /></Suspense></ModuleGuard>} />
          <Route path="hr-catalogue" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><HrRequestCatalogue /></Suspense></ModuleGuard>} />
          <Route path="onboarding" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><Onboarding /></Suspense></ModuleGuard>} />
          <Route path="document-requests" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><DocumentRequests /></Suspense></ModuleGuard>} />
          <Route path="policies" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><PolicyAcknowledgement /></Suspense></ModuleGuard>} />
          <Route path="employee-portal" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><EmployeePortal /></Suspense></ModuleGuard>} />

          {/* Field Service */}
          <Route path="work-orders" element={<ModuleGuard module="field-service"><Suspense fallback={<LoadingSpinner />}><WorkOrderList /></Suspense></ModuleGuard>} />
          <Route path="technician-availability" element={<ModuleGuard module="field-service"><Suspense fallback={<LoadingSpinner />}><TechnicianAvailability /></Suspense></ModuleGuard>} />

          {/* Workflow */}
          <Route path="workflows" element={<ModuleGuard module="workflow"><Suspense fallback={<LoadingSpinner />}><WorkflowList /></Suspense></ModuleGuard>} />
          <Route path="workflows/:id" element={<ModuleGuard module="workflow"><Suspense fallback={<LoadingSpinner />}><WorkflowDetail /></Suspense></ModuleGuard>} />
          <Route path="workflow-logs" element={<ModuleGuard module="workflow"><Suspense fallback={<LoadingSpinner />}><WorkflowLogs /></Suspense></ModuleGuard>} />
          <Route path="workflow-designer" element={<ModuleGuard module="workflow"><Suspense fallback={<LoadingSpinner />}><WorkflowDesigner /></Suspense></ModuleGuard>} />

          {/* Analytics */}
          <Route path="reports" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><Reports /></Suspense></ModuleGuard>} />
          <Route path="dashboards" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><AnalyticsDashboard /></Suspense></ModuleGuard>} />
          <Route path="scheduled-reports" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><ScheduledReports /></Suspense></ModuleGuard>} />
          <Route path="report-builder" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><ReportBuilder /></Suspense></ModuleGuard>} />
          <Route path="drilldown" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><DrillDownReport /></Suspense></ModuleGuard>} />
          <Route path="dashboard-builder" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><DashboardBuilder /></Suspense></ModuleGuard>} />
          <Route path="chart-builder" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><ChartBuilder /></Suspense></ModuleGuard>} />

          {/* ITAM (new) */}
          <Route path="licenses" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><LicenseManagement /></Suspense></ModuleGuard>} />
          <Route path="asset-labels" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><AssetLabels /></Suspense></ModuleGuard>} />
          <Route path="prohibited-software" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><ProhibitedSoftware /></Suspense></ModuleGuard>} />
          <Route path="inventory" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><InventoryManagement /></Suspense></ModuleGuard>} />

          {/* CSM */}
          <Route path="customer-service" element={<ModuleGuard module="csm"><Suspense fallback={<LoadingSpinner />}><CustomerServicePortal /></Suspense></ModuleGuard>} />
          <Route path="partner-portal" element={<ModuleGuard module="csm"><Suspense fallback={<LoadingSpinner />}><PartnerPortal /></Suspense></ModuleGuard>} />

          {/* Help Desk (new) */}
          <Route path="playbooks" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><IncidentPlaybooks /></Suspense></ModuleGuard>} />
          <Route path="oncall" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><OnCallSchedules /></Suspense></ModuleGuard>} />
          <Route path="templates" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><TicketTemplates /></Suspense></ModuleGuard>} />
          <Route path="outages" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><OutageTracking /></Suspense></ModuleGuard>} />
          <Route path="change-calendar" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><ChangeCalendarPage /></Suspense></ModuleGuard>} />
          <Route path="pir" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><PostImplReviews /></Suspense></ModuleGuard>} />
          <Route path="warroom" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><WarRoom /></Suspense></ModuleGuard>} />
          <Route path="diagnosis" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><IncidentDiagnosis /></Suspense></ModuleGuard>} />
          <Route path="ticket-board" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><TicketBoard /></Suspense></ModuleGuard>} />
          <Route path="my-work" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><MyWork /></Suspense></ModuleGuard>} />
          <Route path="major-incidents" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><MajorIncidents /></Suspense></ModuleGuard>} />
          <Route path="cab" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><CabBoard /></Suspense></ModuleGuard>} />
          <Route path="known-errors" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><KnownErrors /></Suspense></ModuleGuard>} />
          <Route path="escalations" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><Escalations /></Suspense></ModuleGuard>} />
          <Route path="sla-monitor" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><SlaMonitor /></Suspense></ModuleGuard>} />
          <Route path="requests" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><Requests /></Suspense></ModuleGuard>} />
          <Route path="assignment" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><AssignmentRouting /></Suspense></ModuleGuard>} />
          <Route path="csat" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><CsatDashboard /></Suspense></ModuleGuard>} />
          <Route path="helpdesk-reports" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><HelpdeskReports /></Suspense></ModuleGuard>} />
          <Route path="helpdesk-admin" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><HelpdeskAdmin /></Suspense></ModuleGuard>} />
          <Route path="audit-trail" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><AuditTrail /></Suspense></ModuleGuard>} />

          {/* ITOM ops */}
          <Route path="ops-tools" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><OpsTools /></Suspense></ModuleGuard>} />
          <Route path="service-map" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><ServiceMap /></Suspense></ModuleGuard>} />

          {/* Settings */}
          <Route path="settings" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Settings /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/users" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Users /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/teams" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Teams /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/roles" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Roles /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/access" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><AccessControl /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/organization" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><OrganizationUnits /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/departments" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Departments /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/sla" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><SlaPlans /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/email" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><EmailSettings /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/integrations" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><Integrations /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/integrations-config" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><IntegrationsConfig /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/audit" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><AuditLogs /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/feature-flags" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><FeatureFlagsPage /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/invitations" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><InvitationsPage /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="settings/delegations" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Delegations /></Suspense></ProtectedRoute>} />
          <Route path="settings/hr-access" element={<AdminRoute><ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><HrAccessControl /></Suspense></ModuleGuard></AdminRoute>} />

          {/* Enterprise expansion modules */}
          <Route path="cmdb" element={<ModuleGuard module="cmdb"><Suspense fallback={<LoadingSpinner />}><CmdbExplorer /></Suspense></ModuleGuard>} />
          <Route path="secops" element={<ModuleGuard module="secops"><Suspense fallback={<LoadingSpinner />}><SecurityOps /></Suspense></ModuleGuard>} />
          <Route path="grc" element={<ModuleGuard module="grc"><Suspense fallback={<LoadingSpinner />}><GrcConsole /></Suspense></ModuleGuard>} />
          <Route path="workplace" element={<ModuleGuard module="workplace"><Suspense fallback={<LoadingSpinner />}><WorkplaceConsole /></Suspense></ModuleGuard>} />
          <Route path="legal" element={<ModuleGuard module="legal"><Suspense fallback={<LoadingSpinner />}><LegalConsole /></Suspense></ModuleGuard>} />
          <Route path="procurement" element={<ModuleGuard module="procurement"><Suspense fallback={<LoadingSpinner />}><ProcurementConsole /></Suspense></ModuleGuard>} />
          <Route path="finance" element={<ModuleGuard module="finance"><Suspense fallback={<LoadingSpinner />}><FinanceConsole /></Suspense></ModuleGuard>} />
          <Route path="esg" element={<ModuleGuard module="esg"><Suspense fallback={<LoadingSpinner />}><EsgConsole /></Suspense></ModuleGuard>} />
          <Route path="settings/modules" element={<AdminRoute><Suspense fallback={<LoadingSpinner />}><ModulesManager /></Suspense></AdminRoute>} />
          <Route path="settings/billing" element={<AdminRoute><Suspense fallback={<LoadingSpinner />}><BillingPortal /></Suspense></AdminRoute>} />
          <Route path="settings/notifications" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><NotificationPrefs /></Suspense></ProtectedRoute>} />
          <Route path="settings/compliance" element={<AdminRoute><ModuleGuard module="settings"><Suspense fallback={<LoadingSpinner />}><ComplianceCenter /></Suspense></ModuleGuard></AdminRoute>} />
          <Route path="ops-governance" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><OpsGovernance /></Suspense></ModuleGuard>} />
          <Route path="growth-tools" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><GrowthTools /></Suspense></ModuleGuard>} />
          <Route path="planning-extras" element={<ModuleGuard module="projects"><Suspense fallback={<LoadingSpinner />}><PlanningExtras /></Suspense></ModuleGuard>} />
          <Route path="communities" element={<ModuleGuard module="csm"><Suspense fallback={<LoadingSpinner />}><Communities /></Suspense></ModuleGuard>} />
          <Route path="unified-inbox" element={<ModuleGuard module="csm"><Suspense fallback={<LoadingSpinner />}><UnifiedInbox /></Suspense></ModuleGuard>} />
          <Route path="shift-handover" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><ShiftHandover /></Suspense></ModuleGuard>} />
          <Route path="manager-hub" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><ManagerHub /></Suspense></ModuleGuard>} />
          <Route path="floor-plans" element={<ModuleGuard module="workplace"><Suspense fallback={<LoadingSpinner />}><FloorPlanViewer /></Suspense></ModuleGuard>} />
          <Route path="clause-library" element={<ModuleGuard module="legal"><Suspense fallback={<LoadingSpinner />}><ClauseLibrary /></Suspense></ModuleGuard>} />
          <Route path="storefront" element={<ModuleGuard module="procurement"><Suspense fallback={<LoadingSpinner />}><Storefront /></Suspense></ModuleGuard>} />
          <Route path="org-switcher" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><OrgSwitcher /></Suspense></ProtectedRoute>} />
          <Route path="settings/platform" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><PlatformAdmin /></Suspense></PlatformRoute>} />

          {/* Super Admin - Tenant Management */}
          <Route path="superadmin" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminDashboard /></Suspense></PlatformRoute>} />
          <Route path="superadmin/tenants" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminTenantList /></Suspense></PlatformRoute>} />
          <Route path="superadmin/tenants/new" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminTenantCreate /></Suspense></PlatformRoute>} />
          <Route path="superadmin/tenants/:id" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminTenantDetail /></Suspense></PlatformRoute>} />
          <Route path="superadmin/plans" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminPlans /></Suspense></PlatformRoute>} />
          <Route path="superadmin/audit" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminAuditLogs /></Suspense></PlatformRoute>} />
          <Route path="superadmin/admins" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminAdmins /></Suspense></PlatformRoute>} />
          <Route path="superadmin/operations" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminOperations /></Suspense></PlatformRoute>} />
          <Route path="superadmin/modules" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminModules /></Suspense></PlatformRoute>} />
          <Route path="superadmin/security" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminSecurity /></Suspense></PlatformRoute>} />
          <Route path="superadmin/settings" element={<PlatformRoute><Suspense fallback={<LoadingSpinner />}><SuperAdminSettings /></Suspense></PlatformRoute>} />
          <Route path="priority-matrix" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><PriorityMatrixEditor /></Suspense></ModuleGuard>} />
          <Route path="lead-capture" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><LeadCapture /></Suspense></ModuleGuard>} />
          <Route path="sales-pipelines" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><SalesPipelines /></Suspense></ModuleGuard>} />
          <Route path="quote-versions" element={<ModuleGuard module="crm"><Suspense fallback={<LoadingSpinner />}><QuoteVersions /></Suspense></ModuleGuard>} />
          <Route path="dispatcher" element={<ModuleGuard module="field-service"><Suspense fallback={<LoadingSpinner />}><DispatcherBoard /></Suspense></ModuleGuard>} />
          <Route path="vuln-ops" element={<ModuleGuard module="secops"><Suspense fallback={<LoadingSpinner />}><VulnOps /></Suspense></ModuleGuard>} />
          <Route path="governance-extras" element={<ModuleGuard module="grc"><Suspense fallback={<LoadingSpinner />}><GovernanceExtras /></Suspense></ModuleGuard>} />
          <Route path="advanced-views" element={<ModuleGuard module="analytics"><Suspense fallback={<LoadingSpinner />}><AdvancedViews /></Suspense></ModuleGuard>} />
          <Route path="hr-doc-templates" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><DocTemplatesHr /></Suspense></ModuleGuard>} />
          <Route path="social-replies" element={<ModuleGuard module="csm"><Suspense fallback={<LoadingSpinner />}><SocialReplyConsole /></Suspense></ModuleGuard>} />
          <Route path="vendor-pack" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><VendorPackView /></Suspense></ModuleGuard>} />
          <Route path="knowledge-insights" element={<ModuleGuard module="helpdesk"><Suspense fallback={<LoadingSpinner />}><KnowledgeInsights /></Suspense></ModuleGuard>} />
          <Route path="discovery-schedules" element={<ModuleGuard module="itom"><Suspense fallback={<LoadingSpinner />}><DiscoverySchedules /></Suspense></ModuleGuard>} />
          <Route path="patch-campaigns" element={<ModuleGuard module="secops"><Suspense fallback={<LoadingSpinner />}><PatchCampaignsPage /></Suspense></ModuleGuard>} />
          <Route path="hr-promotions" element={<ModuleGuard module="hr"><Suspense fallback={<LoadingSpinner />}><HrPromotions /></Suspense></ModuleGuard>} />
          <Route path="contractor-market" element={<ModuleGuard module="field-service"><Suspense fallback={<LoadingSpinner />}><ContractorMarketplace /></Suspense></ModuleGuard>} />
          <Route path="outside-counsel" element={<ModuleGuard module="legal"><Suspense fallback={<LoadingSpinner />}><OutsideCounsel /></Suspense></ModuleGuard>} />
          <Route path="import-wizard" element={<AdminRoute><Suspense fallback={<LoadingSpinner />}><ImportWizard /></Suspense></AdminRoute>} />
          <Route path="approvals" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><ApprovalInbox /></Suspense></ProtectedRoute>} />
          <Route path="decision-tables" element={<ModuleGuard module="workflow"><Suspense fallback={<LoadingSpinner />}><DecisionTablesPage /></Suspense></ModuleGuard>} />
          <Route path="spend-analytics" element={<ModuleGuard module="procurement"><Suspense fallback={<LoadingSpinner />}><SpendAnalytics /></Suspense></ModuleGuard>} />
          <Route path="audit-scanner" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><AuditScanner /></Suspense></ModuleGuard>} />
          <Route path="software-governance" element={<ModuleGuard module="itam"><Suspense fallback={<LoadingSpinner />}><SoftwareGovernance /></Suspense></ModuleGuard>} />
        </Route>

        {/* Setup wizard - standalone, no sidebar */}
        <Route path="/setup" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><TenantOnboarding /></Suspense></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function HydrateAuth() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateThunk());
  }, [dispatch]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <HydrateAuth />
        <AppRoutes />
      </Provider>
    </BrowserRouter>
  );
}
