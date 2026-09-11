import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@core/layout/Layout';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import { AdminRoute, PermissionRoute, PlatformRoute, ProtectedRoute } from '@core/routing/RouteGuards';
import { LoadingSpinner } from '@shared/components/ui';

// Auth
const Login = lazy(() => import('@core/auth/Login'));
const Register = lazy(() => import('@core/auth/Register'));

// Help Desk
const Dashboard = lazy(() => import('@modules/helpdesk/pages/dashboard/Dashboard'));
const TicketList = lazy(() => import('@modules/helpdesk/pages/tickets/TicketList'));
const NewTicket = lazy(() => import('@modules/helpdesk/pages/tickets/NewTicket'));
const TicketDetail = lazy(() => import('@modules/helpdesk/pages/tickets/TicketDetail'));
const Incidents = lazy(() => import('@modules/helpdesk/pages/incidents/Incidents'));
const Problems = lazy(() => import('@modules/helpdesk/pages/problems/Problems'));
const Changes = lazy(() => import('@modules/helpdesk/pages/changes/Changes'));
const KnowledgeBase = lazy(() => import('@modules/helpdesk/pages/dashboard/KnowledgeBase'));
const ServiceCatalog = lazy(() => import('@modules/helpdesk/pages/support/ServiceCatalog'));
const Assets = lazy(() => import('@modules/helpdesk/pages/assets/Assets'));
const AssetDetail = lazy(() => import('@modules/helpdesk/pages/assets/AssetDetail'));

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
const IncidentPlaybooks = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentPlaybooks'));
const OnCallSchedules = lazy(() => import('@modules/helpdesk/pages/support/OnCallSchedules'));
const TicketTemplates = lazy(() => import('@modules/helpdesk/pages/tickets/TicketTemplates'));
const OutageTracking = lazy(() => import('@modules/helpdesk/pages/incidents/OutageTracking'));
const TicketBoard = lazy(() => import('@modules/helpdesk/pages/tickets/TicketBoard'));

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
const ChangeCalendarPage = lazy(() => import('@modules/helpdesk/pages/changes/ChangeCalendarPage'));
const PostImplReviews = lazy(() => import('@modules/helpdesk/pages/incidents/PostImplReviews'));
const ChartBuilder = lazy(() => import('@modules/analytics/pages/ChartBuilder'));
const ResourceAllocation = lazy(() => import('@modules/projects/pages/ResourceAllocation'));
const WarRoom = lazy(() => import('@modules/helpdesk/pages/incidents/WarRoom'));
const IncidentDiagnosis = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentDiagnosis'));
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
const ShiftHandover = lazy(() => import('@modules/helpdesk/pages/support/ShiftHandover'));
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
const SuperAdminControlPlane = lazy(() => import('@modules/superadmin/pages/SuperAdminControlPlane'));
const SuperAdminSla = lazy(() => import('@modules/superadmin/pages/SuperAdminSla'));
const PriorityMatrixEditor = lazy(() => import('@modules/helpdesk/pages/incidents/PriorityMatrixEditor'));
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
const KnowledgeInsights = lazy(() => import('@modules/helpdesk/pages/dashboard/KnowledgeInsights'));
const DiscoverySchedules = lazy(() => import('@modules/itom/pages/DiscoverySchedules'));
const PatchCampaignsPage = lazy(() => import('@modules/secops/pages/PatchCampaigns'));
const HrPromotions = lazy(() => import('@modules/hr/pages/HrPromotions'));
const ContractorMarketplace = lazy(() => import('@modules/fsm/pages/ContractorMarketplace'));
const OutsideCounsel = lazy(() => import('@modules/legal/pages/OutsideCounsel'));
const ImportWizard = lazy(() => import('@modules/settings/pages/ImportWizard'));
const ApprovalInbox = lazy(() => import('@modules/settings/pages/ApprovalInbox'));
const DecisionTablesPage = lazy(() => import('@modules/workflow/pages/DecisionTables'));
const TicketCrud = lazy(() => import('@modules/helpdesk/pages/tickets/TicketCrud'));
const MyWork = lazy(() => import('@modules/helpdesk/pages/support/MyWork'));
const MajorIncidents = lazy(() => import('@modules/helpdesk/pages/incidents/MajorIncidents'));
const CabBoard = lazy(() => import('@modules/helpdesk/pages/support/CabBoard'));
const KnownErrors = lazy(() => import('@modules/helpdesk/pages/reports/KnownErrors'));
const Escalations = lazy(() => import('@modules/helpdesk/pages/incidents/Escalations'));
const SlaMonitor = lazy(() => import('@modules/helpdesk/pages/incidents/SlaMonitor'));
const Requests = lazy(() => import('@modules/helpdesk/pages/tickets/Requests'));
const AssignmentRouting = lazy(() => import('@modules/helpdesk/pages/tickets/AssignmentRouting'));
const CsatDashboard = lazy(() => import('@modules/helpdesk/pages/reports/CsatDashboard'));
const SupportEmail = lazy(() => import('@modules/helpdesk/pages/support/SupportEmail'));
const HelpdeskReports = lazy(() => import('@modules/helpdesk/pages/reports/HelpdeskReports'));
const HelpdeskAdmin = lazy(() => import('@modules/helpdesk/pages/admin/HelpdeskAdmin'));
const AuditTrail = lazy(() => import('@modules/helpdesk/pages/incidents/AuditTrail'));
const Otto = lazy(() => import('@modules/helpdesk/pages/support/Otto'));
const Alerts = lazy(() => import('@modules/helpdesk/pages/incidents/Alerts'));
const CMDBImpact = lazy(() => import('@modules/helpdesk/pages/misc/CMDBImpact'));
const CustomAuth = lazy(() => import('@modules/settings/pages/CustomAuth'));
const OpsWorkspace = lazy(() => import('@modules/helpdesk/pages/support/OpsWorkspace'));
const BotDesigner = lazy(() => import('@modules/settings/pages/BotDesigner'));
const NeuralSearch = lazy(() => import('@modules/helpdesk/pages/knowledge/NeuralSearch'));
const ServiceHealth = lazy(() => import('@modules/cmdb/pages/ServiceHealth'));
const IncidentCrud = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentCrud'));
const ProblemCrud = lazy(() => import('@modules/helpdesk/pages/problems/ProblemCrud'));
const ChangeCrud = lazy(() => import('@modules/helpdesk/pages/changes/ChangeCrud'));
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

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup/modules" element={<Navigate to="/" replace />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Help Desk */}
          <Route path="tickets/manage" element={<ModuleGuard module="helpdesk"><TicketCrud /></ModuleGuard>} />
          <Route path="incidents-crud" element={<ModuleGuard module="helpdesk"><IncidentCrud /></ModuleGuard>} />
          <Route path="problems-crud" element={<ModuleGuard module="helpdesk"><ProblemCrud /></ModuleGuard>} />
          <Route path="changes-crud" element={<ModuleGuard module="helpdesk"><ChangeCrud /></ModuleGuard>} />
          <Route path="opportunities-crud" element={<ModuleGuard module="crm"><OppCrud /></ModuleGuard>} />
          <Route path="assets-crud" element={<ModuleGuard module="itam"><AssetCrud /></ModuleGuard>} />
          <Route path="ci-crud" element={<ModuleGuard module="cmdb"><CiCrud /></ModuleGuard>} />
          <Route path="hr-cases-crud" element={<ModuleGuard module="hr"><HrCaseCrud /></ModuleGuard>} />
          <Route path="sec-incidents-crud" element={<ModuleGuard module="secops"><SecurityIncidentCrud /></ModuleGuard>} />
          <Route path="risks-crud" element={<ModuleGuard module="grc"><RiskCrud /></ModuleGuard>} />
          <Route path="legal-matters-crud" element={<ModuleGuard module="legal"><LegalMatterCrud /></ModuleGuard>} />
          <Route path="finance-cases-crud" element={<ModuleGuard module="finance"><FinanceCaseCrud /></ModuleGuard>} />
          <Route path="tickets" element={<ModuleGuard module="helpdesk"><TicketList /></ModuleGuard>} />
          <Route path="tickets/new" element={<ModuleGuard module="helpdesk"><NewTicket /></ModuleGuard>} />
          <Route path="tickets/:number" element={<ModuleGuard module="helpdesk"><TicketDetail /></ModuleGuard>} />
          <Route path="incidents" element={<ModuleGuard module="helpdesk"><Incidents /></ModuleGuard>} />
          <Route path="problems" element={<ModuleGuard module="helpdesk"><Problems /></ModuleGuard>} />
          <Route path="changes" element={<ModuleGuard module="helpdesk"><Changes /></ModuleGuard>} />
          <Route path="kb" element={<ModuleGuard module="helpdesk"><KnowledgeBase /></ModuleGuard>} />
          <Route path="catalog" element={<ModuleGuard module="helpdesk"><ServiceCatalog /></ModuleGuard>} />

          {/* ITAM */}
          <Route path="assets" element={<ModuleGuard module="itam"><Assets /></ModuleGuard>} />
          <Route path="assets/:id" element={<ModuleGuard module="itam"><AssetDetail /></ModuleGuard>} />

          {/* CRM */}
          <Route path="leads" element={<ModuleGuard module="crm"><LeadList /></ModuleGuard>} />
          <Route path="leads/:id" element={<ModuleGuard module="crm"><LeadDetail /></ModuleGuard>} />
          <Route path="accounts" element={<ModuleGuard module="crm"><AccountList /></ModuleGuard>} />
          <Route path="accounts/:id" element={<ModuleGuard module="crm"><AccountDetail /></ModuleGuard>} />
          <Route path="contacts" element={<ModuleGuard module="crm"><ContactList /></ModuleGuard>} />
          <Route path="opportunities" element={<ModuleGuard module="crm"><OpportunityList /></ModuleGuard>} />
          <Route path="pipeline" element={<ModuleGuard module="crm"><Pipeline /></ModuleGuard>} />
          <Route path="quotes" element={<ModuleGuard module="crm"><QuoteList /></ModuleGuard>} />
          <Route path="price-books" element={<ModuleGuard module="crm"><PriceBooks /></ModuleGuard>} />
          <Route path="sequences" element={<ModuleGuard module="crm"><ActivitySequences /></ModuleGuard>} />
          <Route path="segments" element={<ModuleGuard module="crm"><Segments /></ModuleGuard>} />
          <Route path="duplicates" element={<ModuleGuard module="crm"><DuplicateDetection /></ModuleGuard>} />
          <Route path="crm-reports" element={<ModuleGuard module="crm"><CrmReports /></ModuleGuard>} />
          <Route path="esign" element={<ModuleGuard module="crm"><ESignatures /></ModuleGuard>} />

          {/* ITOM */}
          <Route path="resources" element={<ModuleGuard module="itom"><ResourceRegistry /></ModuleGuard>} />
          <Route path="alerts" element={<ModuleGuard module="itom"><AlertDashboard /></ModuleGuard>} />

          {/* Projects */}
          <Route path="projects" element={<ModuleGuard module="projects"><ProjectList /></ModuleGuard>} />
          <Route path="project-templates" element={<ModuleGuard module="projects"><ProjectTemplates /></ModuleGuard>} />
          <Route path="project-issues" element={<ModuleGuard module="projects"><ProjectIssues /></ModuleGuard>} />
          <Route path="timesheets" element={<ModuleGuard module="projects"><Timesheets /></ModuleGuard>} />
          <Route path="project-risks" element={<ModuleGuard module="projects"><ProjectRisk /></ModuleGuard>} />
          <Route path="gantt" element={<ModuleGuard module="projects"><GanttChart /></ModuleGuard>} />
          <Route path="project-board" element={<ModuleGuard module="projects"><ProjectKanban /></ModuleGuard>} />
          <Route path="portfolio" element={<ModuleGuard module="projects"><Portfolio /></ModuleGuard>} />
          <Route path="resource-allocation" element={<ModuleGuard module="projects"><ResourceAllocation /></ModuleGuard>} />

          {/* HR */}
          <Route path="hr" element={<ModuleGuard module="hr"><HrDashboard /></ModuleGuard>} />
          <Route path="hr-catalogue" element={<ModuleGuard module="hr"><HrRequestCatalogue /></ModuleGuard>} />
          <Route path="onboarding" element={<ModuleGuard module="hr"><Onboarding /></ModuleGuard>} />
          <Route path="document-requests" element={<ModuleGuard module="hr"><DocumentRequests /></ModuleGuard>} />
          <Route path="policies" element={<ModuleGuard module="hr"><PolicyAcknowledgement /></ModuleGuard>} />
          <Route path="employee-portal" element={<ModuleGuard module="hr"><EmployeePortal /></ModuleGuard>} />

          {/* Field Service */}
          <Route path="work-orders" element={<ModuleGuard module="field-service"><WorkOrderList /></ModuleGuard>} />
          <Route path="technician-availability" element={<ModuleGuard module="field-service"><TechnicianAvailability /></ModuleGuard>} />

          {/* Workflow */}
          <Route path="workflows" element={<ModuleGuard module="workflow"><WorkflowList /></ModuleGuard>} />
          <Route path="workflows/:id" element={<ModuleGuard module="workflow"><WorkflowDetail /></ModuleGuard>} />
          <Route path="workflow-logs" element={<ModuleGuard module="workflow"><WorkflowLogs /></ModuleGuard>} />
          <Route path="workflow-designer" element={<ModuleGuard module="workflow"><WorkflowDesigner /></ModuleGuard>} />

          {/* Analytics */}
          <Route path="reports" element={<ModuleGuard module="analytics"><Reports /></ModuleGuard>} />
          <Route path="dashboards" element={<ModuleGuard module="analytics"><AnalyticsDashboard /></ModuleGuard>} />
          <Route path="scheduled-reports" element={<ModuleGuard module="analytics"><ScheduledReports /></ModuleGuard>} />
          <Route path="report-builder" element={<ModuleGuard module="analytics"><ReportBuilder /></ModuleGuard>} />
          <Route path="drilldown" element={<ModuleGuard module="analytics"><DrillDownReport /></ModuleGuard>} />
          <Route path="dashboard-builder" element={<ModuleGuard module="analytics"><DashboardBuilder /></ModuleGuard>} />
          <Route path="chart-builder" element={<ModuleGuard module="analytics"><ChartBuilder /></ModuleGuard>} />

          {/* ITAM (new) */}
          <Route path="licenses" element={<ModuleGuard module="itam"><LicenseManagement /></ModuleGuard>} />
          <Route path="asset-labels" element={<ModuleGuard module="itam"><AssetLabels /></ModuleGuard>} />
          <Route path="prohibited-software" element={<ModuleGuard module="itam"><ProhibitedSoftware /></ModuleGuard>} />
          <Route path="inventory" element={<ModuleGuard module="itam"><InventoryManagement /></ModuleGuard>} />

          {/* CSM */}
          <Route path="customer-service" element={<ModuleGuard module="csm"><CustomerServicePortal /></ModuleGuard>} />
          <Route path="partner-portal" element={<ModuleGuard module="csm"><PartnerPortal /></ModuleGuard>} />

          {/* Help Desk (new) */}
          <Route path="playbooks" element={<ModuleGuard module="helpdesk"><IncidentPlaybooks /></ModuleGuard>} />
          <Route path="oncall" element={<ModuleGuard module="helpdesk"><OnCallSchedules /></ModuleGuard>} />
          <Route path="templates" element={<ModuleGuard module="helpdesk"><TicketTemplates /></ModuleGuard>} />
          <Route path="outages" element={<ModuleGuard module="helpdesk"><OutageTracking /></ModuleGuard>} />
          <Route path="change-calendar" element={<ModuleGuard module="helpdesk"><ChangeCalendarPage /></ModuleGuard>} />
          <Route path="pir" element={<ModuleGuard module="helpdesk"><PostImplReviews /></ModuleGuard>} />
          <Route path="warroom" element={<ModuleGuard module="helpdesk"><WarRoom /></ModuleGuard>} />
          <Route path="diagnosis" element={<ModuleGuard module="helpdesk"><IncidentDiagnosis /></ModuleGuard>} />
          <Route path="ticket-board" element={<ModuleGuard module="helpdesk"><TicketBoard /></ModuleGuard>} />
          <Route path="my-work" element={<ModuleGuard module="helpdesk"><MyWork /></ModuleGuard>} />
          <Route path="major-incidents" element={<ModuleGuard module="helpdesk"><MajorIncidents /></ModuleGuard>} />
          <Route path="cab" element={<ModuleGuard module="helpdesk"><CabBoard /></ModuleGuard>} />
          <Route path="known-errors" element={<ModuleGuard module="helpdesk"><KnownErrors /></ModuleGuard>} />
          <Route path="escalations" element={<ModuleGuard module="helpdesk"><Escalations /></ModuleGuard>} />
          <Route path="sla-monitor" element={<ModuleGuard module="helpdesk"><SlaMonitor /></ModuleGuard>} />
          <Route path="requests" element={<ModuleGuard module="helpdesk"><Requests /></ModuleGuard>} />
          <Route path="assignment" element={<ModuleGuard module="helpdesk"><AssignmentRouting /></ModuleGuard>} />
          <Route path="csat" element={<ModuleGuard module="helpdesk"><CsatDashboard /></ModuleGuard>} />
          <Route path="support-email" element={<ProtectedRoute><SupportEmail /></ProtectedRoute>} />
          <Route path="helpdesk-reports" element={<ModuleGuard module="helpdesk"><HelpdeskReports /></ModuleGuard>} />
          <Route path="helpdesk-admin" element={<ModuleGuard module="helpdesk"><HelpdeskAdmin /></ModuleGuard>} />
          <Route path="audit-trail" element={<ModuleGuard module="helpdesk"><AuditTrail /></ModuleGuard>} />
          <Route path="otto" element={<ModuleGuard module="ai"><Otto /></ModuleGuard>} />
          <Route path="alert-manager" element={<ModuleGuard module="itom"><Alerts /></ModuleGuard>} />
          <Route path="cmdb-impact" element={<ModuleGuard module="itam"><CMDBImpact /></ModuleGuard>} />
          <Route path="settings/custom-auth" element={<AdminRoute><ModuleGuard module="settings"><CustomAuth /></ModuleGuard></AdminRoute>} />
          <Route path="ops-workspace" element={<ModuleGuard module="helpdesk"><OpsWorkspace /></ModuleGuard>} />
          <Route path="neural-search" element={<ModuleGuard module="helpdesk"><NeuralSearch /></ModuleGuard>} />
          <Route path="settings/bots" element={<AdminRoute><ModuleGuard module="settings"><BotDesigner /></ModuleGuard></AdminRoute>} />
          <Route path="service-health" element={<ModuleGuard module="cmdb"><ServiceHealth /></ModuleGuard>} />

          {/* ITOM ops */}
          <Route path="ops-tools" element={<ModuleGuard module="itom"><OpsTools /></ModuleGuard>} />
          <Route path="service-map" element={<ModuleGuard module="itom"><ServiceMap /></ModuleGuard>} />

          {/* Settings */}
          <Route path="settings" element={<AdminRoute><ModuleGuard module="settings"><Settings /></ModuleGuard></AdminRoute>} />
          <Route path="settings/users" element={<AdminRoute><ModuleGuard module="settings"><Users /></ModuleGuard></AdminRoute>} />
          <Route path="settings/teams" element={<AdminRoute><ModuleGuard module="settings"><Teams /></ModuleGuard></AdminRoute>} />
          <Route path="settings/roles" element={<AdminRoute><ModuleGuard module="settings"><Roles /></ModuleGuard></AdminRoute>} />
          <Route path="settings/access" element={<AdminRoute><ModuleGuard module="settings"><AccessControl /></ModuleGuard></AdminRoute>} />
          <Route path="settings/organization" element={<AdminRoute><ModuleGuard module="settings"><OrganizationUnits /></ModuleGuard></AdminRoute>} />
          <Route path="settings/departments" element={<AdminRoute><ModuleGuard module="settings"><Departments /></ModuleGuard></AdminRoute>} />
          <Route path="settings/sla" element={<AdminRoute><ModuleGuard module="settings"><SlaPlans /></ModuleGuard></AdminRoute>} />
          <Route path="settings/email" element={<AdminRoute><ModuleGuard module="settings"><EmailSettings /></ModuleGuard></AdminRoute>} />
          <Route path="settings/integrations" element={<AdminRoute><ModuleGuard module="settings"><Integrations /></ModuleGuard></AdminRoute>} />
          <Route path="settings/integrations-config" element={<AdminRoute><ModuleGuard module="settings"><IntegrationsConfig /></ModuleGuard></AdminRoute>} />
          <Route path="settings/audit" element={<AdminRoute><ModuleGuard module="settings"><AuditLogs /></ModuleGuard></AdminRoute>} />
          <Route path="settings/feature-flags" element={<AdminRoute><ModuleGuard module="settings"><FeatureFlagsPage /></ModuleGuard></AdminRoute>} />
          <Route path="settings/invitations" element={<AdminRoute><ModuleGuard module="settings"><InvitationsPage /></ModuleGuard></AdminRoute>} />
          <Route path="settings/delegations" element={<ProtectedRoute><Delegations /></ProtectedRoute>} />
          <Route path="settings/hr-access" element={<AdminRoute><ModuleGuard module="hr"><HrAccessControl /></ModuleGuard></AdminRoute>} />

          {/* Enterprise expansion modules */}
          <Route path="cmdb" element={<ModuleGuard module="cmdb"><CmdbExplorer /></ModuleGuard>} />
          <Route path="secops" element={<ModuleGuard module="secops"><SecurityOps /></ModuleGuard>} />
          <Route path="grc" element={<ModuleGuard module="grc"><GrcConsole /></ModuleGuard>} />
          <Route path="workplace" element={<ModuleGuard module="workplace"><WorkplaceConsole /></ModuleGuard>} />
          <Route path="legal" element={<ModuleGuard module="legal"><LegalConsole /></ModuleGuard>} />
          <Route path="procurement" element={<ModuleGuard module="procurement"><ProcurementConsole /></ModuleGuard>} />
          <Route path="finance" element={<ModuleGuard module="finance"><FinanceConsole /></ModuleGuard>} />
          <Route path="esg" element={<ModuleGuard module="esg"><EsgConsole /></ModuleGuard>} />
          <Route path="settings/modules" element={<AdminRoute><ModulesManager /></AdminRoute>} />
          <Route path="settings/billing" element={<AdminRoute><BillingPortal /></AdminRoute>} />
          <Route path="settings/notifications" element={<ProtectedRoute><NotificationPrefs /></ProtectedRoute>} />
          <Route path="settings/compliance" element={<AdminRoute><ModuleGuard module="settings"><ComplianceCenter /></ModuleGuard></AdminRoute>} />
          <Route path="ops-governance" element={<ModuleGuard module="itom"><OpsGovernance /></ModuleGuard>} />
          <Route path="growth-tools" element={<ModuleGuard module="crm"><GrowthTools /></ModuleGuard>} />
          <Route path="planning-extras" element={<ModuleGuard module="projects"><PlanningExtras /></ModuleGuard>} />
          <Route path="communities" element={<ModuleGuard module="csm"><Communities /></ModuleGuard>} />
          <Route path="unified-inbox" element={<ModuleGuard module="csm"><UnifiedInbox /></ModuleGuard>} />
          <Route path="shift-handover" element={<ModuleGuard module="helpdesk"><ShiftHandover /></ModuleGuard>} />
          <Route path="manager-hub" element={<ModuleGuard module="hr"><ManagerHub /></ModuleGuard>} />
          <Route path="floor-plans" element={<ModuleGuard module="workplace"><FloorPlanViewer /></ModuleGuard>} />
          <Route path="clause-library" element={<ModuleGuard module="legal"><ClauseLibrary /></ModuleGuard>} />
          <Route path="storefront" element={<ModuleGuard module="procurement"><Storefront /></ModuleGuard>} />
          <Route path="org-switcher" element={<ProtectedRoute><OrgSwitcher /></ProtectedRoute>} />
          <Route path="settings/platform" element={<PlatformRoute><PlatformAdmin /></PlatformRoute>} />

          {/* Super Admin - Tenant Management */}
          <Route path="superadmin" element={<PlatformRoute permission="saas.dashboard.read"><SuperAdminDashboard /></PlatformRoute>} />
          <Route path="superadmin/tenants" element={<PlatformRoute><SuperAdminTenantList /></PlatformRoute>} />
          <Route path="superadmin/tenants/new" element={<PlatformRoute permission="saas.tenant.create"><SuperAdminTenantCreate /></PlatformRoute>} />
          <Route path="superadmin/tenants/:id" element={<PlatformRoute><SuperAdminTenantDetail /></PlatformRoute>} />
          <Route path="superadmin/plans" element={<PlatformRoute permission="saas.plan.read"><SuperAdminPlans /></PlatformRoute>} />
          <Route path="superadmin/audit" element={<PlatformRoute permission="saas.audit.read"><SuperAdminAuditLogs /></PlatformRoute>} />
          <Route path="superadmin/admins" element={<PlatformRoute permission="saas.admin.manage"><SuperAdminAdmins /></PlatformRoute>} />
          <Route path="superadmin/operations" element={<PlatformRoute permission="saas.operations.health.read"><SuperAdminOperations /></PlatformRoute>} />
          <Route path="superadmin/modules" element={<PlatformRoute permission="saas.module.read"><SuperAdminModules /></PlatformRoute>} />
          <Route path="superadmin/security" element={<PlatformRoute permission="saas.security.read"><SuperAdminSecurity /></PlatformRoute>} />
          <Route path="superadmin/settings" element={<PlatformRoute permission="saas.platform.configure"><SuperAdminSettings /></PlatformRoute>} />
          <Route path="superadmin/control" element={<PlatformRoute permission="saas.platform.configure"><SuperAdminControlPlane /></PlatformRoute>} />
          <Route path="superadmin/sla" element={<PlatformRoute permission="saas.sla.read"><SuperAdminSla /></PlatformRoute>} />
          <Route path="priority-matrix" element={<ModuleGuard module="helpdesk"><PriorityMatrixEditor /></ModuleGuard>} />
          <Route path="lead-capture" element={<ModuleGuard module="crm"><LeadCapture /></ModuleGuard>} />
          <Route path="sales-pipelines" element={<ModuleGuard module="crm"><SalesPipelines /></ModuleGuard>} />
          <Route path="quote-versions" element={<ModuleGuard module="crm"><QuoteVersions /></ModuleGuard>} />
          <Route path="dispatcher" element={<ModuleGuard module="field-service"><DispatcherBoard /></ModuleGuard>} />
          <Route path="vuln-ops" element={<ModuleGuard module="secops"><VulnOps /></ModuleGuard>} />
          <Route path="governance-extras" element={<ModuleGuard module="grc"><GovernanceExtras /></ModuleGuard>} />
          <Route path="advanced-views" element={<ModuleGuard module="analytics"><AdvancedViews /></ModuleGuard>} />
          <Route path="hr-doc-templates" element={<ModuleGuard module="hr"><DocTemplatesHr /></ModuleGuard>} />
          <Route path="social-replies" element={<ModuleGuard module="csm"><SocialReplyConsole /></ModuleGuard>} />
          <Route path="vendor-pack" element={<ModuleGuard module="itam"><VendorPackView /></ModuleGuard>} />
          <Route path="knowledge-insights" element={<ModuleGuard module="helpdesk"><KnowledgeInsights /></ModuleGuard>} />
          <Route path="discovery-schedules" element={<ModuleGuard module="itom"><DiscoverySchedules /></ModuleGuard>} />
          <Route path="patch-campaigns" element={<ModuleGuard module="secops"><PatchCampaignsPage /></ModuleGuard>} />
          <Route path="hr-promotions" element={<ModuleGuard module="hr"><HrPromotions /></ModuleGuard>} />
          <Route path="contractor-market" element={<ModuleGuard module="field-service"><ContractorMarketplace /></ModuleGuard>} />
          <Route path="outside-counsel" element={<ModuleGuard module="legal"><OutsideCounsel /></ModuleGuard>} />
          <Route path="import-wizard" element={<AdminRoute><ImportWizard /></AdminRoute>} />
          <Route path="approvals" element={<ProtectedRoute><ApprovalInbox /></ProtectedRoute>} />
          <Route path="decision-tables" element={<ModuleGuard module="workflow"><DecisionTablesPage /></ModuleGuard>} />
          <Route path="spend-analytics" element={<ModuleGuard module="procurement"><SpendAnalytics /></ModuleGuard>} />
          <Route path="audit-scanner" element={<ModuleGuard module="itam"><AuditScanner /></ModuleGuard>} />
          <Route path="software-governance" element={<ModuleGuard module="itam"><SoftwareGovernance /></ModuleGuard>} />
        </Route>

        {/* Setup wizard - standalone, no sidebar */}
        <Route path="/setup" element={<ProtectedRoute><TenantOnboarding /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
