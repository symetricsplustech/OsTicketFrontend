import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@features/auth/src/LoginPage";
import { LandingPage } from "@features/auth/src/LandingPage";
import { RegisterPage } from "@features/auth/src/RegisterPage";
import { ConfirmEmailPage, ForgotPasswordPage, ResetPasswordPage } from "@features/auth/src/AccountRecoveryPages";
import { MfaPage } from "@features/auth/src/MfaPage";
import { PlatformHomePage } from "@features/platform/home/src/PlatformHomePage";
import { NoInstancesPage } from "@features/platform/home/src/NoInstancesPage";
import { CreateInstancePage } from "@features/platform/home/src/CreateInstancePage";
import { InvitationAcceptancePage } from "@features/platform/home/src/InvitationAcceptancePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthorizationGuard } from "@app/guards/AuthorizationGuard";
import { PlatformShell } from "@shells/PlatformShell";
import { InstanceAdminShell } from "@shells/InstanceAdminShell";
import { SaaSShell } from "@shells/SaaSShell";
import { ItsmAdminShell } from "@shells/ItsmAdminShell";
import { Overview } from "@features/itsm-admin/Overview";
import { IncidentConfig } from "@features/itsm-admin/IncidentConfig";
import { ProblemConfig } from "@features/itsm-admin/ProblemConfig";
import { ChangeConfig } from "@features/itsm-admin/ChangeConfig";
import { CatalogAdmin } from "@features/itsm-admin/CatalogAdmin";
import { KnowledgeAdmin } from "@features/itsm-admin/KnowledgeAdmin";
import { SLAConfig } from "@features/itsm-admin/SLAConfig";
import { RoutingAdmin } from "@features/itsm-admin/RoutingAdmin";
import { ApprovalsAdmin } from "@features/itsm-admin/ApprovalsAdmin";
import { OnCallAdmin } from "@features/itsm-admin/OnCallAdmin";
import { CMDBAdmin } from "@features/itsm-admin/CMDBAdmin";
import { ReleaseAdmin } from "@features/itsm-admin/ReleaseAdmin";
import { ImprovementAdmin } from "@features/itsm-admin/ImprovementAdmin";
import { OutageAdmin } from "@features/itsm-admin/OutageAdmin";
import { FormsFields } from "@features/itsm-admin/FormsFields";
import { TemplatesPage } from "@features/itsm-admin/TemplatesPage";
import { NotificationsPage } from "@features/itsm-admin/NotificationsPage";
import { AutomationPage } from "@features/itsm-admin/AutomationPage";
import { ReportsPage } from "@features/itsm-admin/ReportsPage";
import { AuditPage } from "@features/itsm-admin/AuditPage";
import { CategoriesPage } from "@features/itsm-admin/CategoriesPage";
import { PriorityMatrix } from "@features/itsm-admin/PriorityMatrix";
import { LifecycleConfig } from "@features/itsm-admin/LifecycleConfig";
import { EscalationConfig } from "@features/itsm-admin/EscalationConfig";
import { WorkspaceShell } from "@shells/WorkspaceShell";
import { ManagerShell } from "@shells/ManagerShell";
import { DispatcherShell } from "@shells/DispatcherShell";
import { FieldEngineerShell } from "@shells/FieldEngineerShell";
import { RequesterPortalShell } from "@shells/RequesterPortalShell";
import { Unauthorized } from "@app/layouts/Unauthorized";
import { NotFound } from "@app/layouts/NotFound";
import { CoreRecords } from "@features/operations/CoreRecords";
import { WorkspaceHome, MyWork, IncidentList, IncidentWorkspace, ProblemList, ProblemWorkspace, ChangeList, ChangeWorkspace, ChangeCalendar, KnowledgeList, KnowledgeArticle, SLAMonitor, ApprovalInbox, MajorIncidentWorkspace, CMDBWorkspace, CIWorkspace, ServiceWorkspace, ReleaseWorkspace, ImprovementWorkspace, OutageWorkspace, AvailabilityDashboard, WalkUp } from "@features/operations/engineer";
import { ManagerDashboard, TeamQueue, EscalationsPage, TeamReports } from "@features/operations/manager";
import { DispatchDashboard, DispatchBoard, EngineerDirectory, SchedulePage } from "@features/operations/dispatcher";
import { FieldHome, FieldJobs, FieldJobDetail, FieldAvailability } from "@features/operations/field";
import { ITSMAdminRoutes } from "@features/itsm-admin/ITSMAdminRoutes";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/welcome", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/confirm-email", element: <ConfirmEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/mfa", element: <MfaPage /> },

  { element: <ProtectedRoute><PlatformShell /></ProtectedRoute>, children: [
    { path: "/platform", element: <PlatformHomePage /> },
    { path: "/no-instances", element: <NoInstancesPage /> },
    { path: "/platform/instances/new", element: <CreateInstancePage /> },
    { path: "/platform/invitations/:instanceId", element: <InvitationAcceptancePage /> },
  ] },

  { element: <ProtectedRoute requireInstance><InstanceAdminShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/admin/organization/companies", element: <CompaniesPage /> },
    { path: "/instances/:instanceId/admin/organization", element: <OrganizationStructurePage /> },
    { path: "/instances/:instanceId/people/users", element: <UsersDirectoryPage /> },
    { path: "/instances/:instanceId/people/users/:userId", element: <UsersDirectoryPage /> },
    { path: "/instances/:instanceId/people/hierarchy", element: <OrganizationStructurePage /> },
    { path: "/instances/:instanceId/access/effective-access", element: <EffectiveAccessPage /> },
    { path: "/instances/:instanceId/access/delegations", element: <DelegationsPage /> },
    { path: "/instances/:instanceId/admin/overview", element: <PlatformHomePage /> },
  ] },

  { element: <ProtectedRoute requireInstance><ItsmAdminShell /></ProtectedRoute>, children: [
    ...ITSMAdminRoutes,
  ] },

  { element: <ProtectedRoute requireInstance><WorkspaceShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/workspace", element: <WorkspaceHome /> },
    { path: "/instances/:instanceId/workspace/my-work", element: <MyWork /> },
    { path: "/instances/:instanceId/workspace/incidents", element: <IncidentList /> },
    { path: "/instances/:instanceId/workspace/incidents/new", element: <CoreRecords screen={{ title: "Create Incident", area: "Incident", kind: "settings", path: "/instances/demo/incidents/new", area: "Incident" }} domain="incidents" /> },
    { path: "/instances/:instanceId/workspace/incidents/:id", element: <IncidentWorkspace /> },
    { path: "/instances/:instanceId/workspace/problems", element: <ProblemList /> },
    { path: "/instances/:instanceId/workspace/problems/new", element: <CoreRecords screen={{ title: "Create Problem", area: "Problem", kind: "settings", path: "/instances/demo/problems/new", area: "Problem" }} domain="problems" /> },
    { path: "/instances/:instanceId/workspace/problems/:id", element: <ProblemWorkspace /> },
    { path: "/instances/:instanceId/workspace/changes", element: <ChangeList /> },
    { path: "/instances/:instanceId/workspace/changes/new", element: <CoreRecords screen={{ title: "Create Change", area: "Change", kind: "settings", path: "/instances/demo/changes/new", area: "Change" }} domain="changes" /> },
    { path: "/instances/:instanceId/workspace/changes/:id", element: <ChangeWorkspace /> },
    { path: "/instances/:instanceId/workspace/change-calendar", element: <ChangeCalendar /> },
    { path: "/instances/:instanceId/workspace/requests", element: <CoreRecords screen={{ title: "Requests", area: "Request", kind: "list", path: "/instances/demo/requests", area: "Request" }} domain="incidents" /> },
    { path: "/instances/:instanceId/workspace/knowledge", element: <KnowledgeList /> },
    { path: "/instances/:instanceId/workspace/knowledge/:articleId", element: <KnowledgeArticle /> },
    { path: "/instances/:instanceId/workspace/approvals", element: <ApprovalInbox /> },
    { path: "/instances/:instanceId/workspace/cmdb", element: <CMDBWorkspace /> },
    { path: "/instances/:instanceId/workspace/cmdb/cis", element: <CMDBWorkspace /> },
    { path: "/instances/:instanceId/workspace/cmdb/cis/:id", element: <CIWorkspace /> },
    { path: "/instances/:instanceId/workspace/services", element: <ServiceWorkspace /> },
    { path: "/instances/:instanceId/workspace/services/:id", element: <ServiceWorkspace /> },
    { path: "/instances/:instanceId/workspace/releases", element: <ReleaseWorkspace /> },
    { path: "/instances/:instanceId/workspace/releases/:id", element: <ReleaseWorkspace /> },
    { path: "/instances/:instanceId/workspace/improvements", element: <ImprovementWorkspace /> },
    { path: "/instances/:instanceId/workspace/improvements/:id", element: <ImprovementWorkspace /> },
    { path: "/instances/:instanceId/workspace/outages", element: <OutageWorkspace /> },
    { path: "/instances/:instanceId/workspace/outages/:id", element: <OutageWorkspace /> },
    { path: "/instances/:instanceId/workspace/availability", element: <AvailabilityDashboard /> },
    { path: "/instances/:instanceId/workspace/sla", element: <SLAMonitor /> },
    { path: "/instances/:instanceId/workspace/major-incidents", element: <MajorIncidentWorkspace /> },
    { path: "/instances/:instanceId/workspace/major-incidents/:id", element: <MajorIncidentWorkspace /> },
    { path: "/instances/:instanceId/workspace/walk-up", element: <WalkUp /> },
  ] },

  { element: <ProtectedRoute requireInstance><ManagerShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/manager", element: <ManagerDashboard /> },
    { path: "/instances/:instanceId/manager/team-work", element: <TeamQueue /> },
    { path: "/instances/:instanceId/manager/queues", element: <TeamQueue /> },
    { path: "/instances/:instanceId/manager/workload", element: <ManagerDashboard /> },
    { path: "/instances/:instanceId/manager/escalations", element: <EscalationsPage /> },
    { path: "/instances/:instanceId/manager/approvals", element: <ApprovalInbox /> },
    { path: "/instances/:instanceId/manager/sla-risk", element: <SLAMonitor /> },
    { path: "/instances/:instanceId/manager/reports", element: <TeamReports /> },
    { path: "/instances/:instanceId/manager/engineers", element: <EngineerDirectory /> },
    { path: "/instances/:instanceId/manager/teams", element: <TeamQueue /> },
    { path: "/instances/:instanceId/manager/schedule", element: <SchedulePage /> },
    { path: "/instances/:instanceId/manager/reassignments", element: <DispatchDashboard /> },
  ] },

  { element: <ProtectedRoute requireInstance><DispatcherShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/dispatch", element: <DispatchDashboard /> },
    { path: "/instances/:instanceId/dispatch/unassigned", element: <DispatchBoard /> },
    { path: "/instances/:instanceId/dispatch/dispatch-board", element: <DispatchBoard /> },
    { path: "/instances/:instanceId/dispatch/engineers", element: <EngineerDirectory /> },
    { path: "/instances/:instanceId/dispatch/schedule", element: <SchedulePage /> },
    { path: "/instances/:instanceId/dispatch/sla-risk", element: <SLAMonitor /> },
    { path: "/instances/:instanceId/dispatch/escalations", element: <EscalationsPage /> },
    { path: "/instances/:instanceId/dispatch/reassignments", element: <DispatchDashboard /> },
  ] },

  { element: <ProtectedRoute requireInstance><FieldEngineerShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/field", element: <FieldHome /> },
    { path: "/instances/:instanceId/field/my-day", element: <FieldHome /> },
    { path: "/instances/:instanceId/field/jobs", element: <FieldJobs /> },
    { path: "/instances/:instanceId/field/jobs/:id", element: <FieldJobDetail /> },
    { path: "/instances/:instanceId/field/knowledge", element: <KnowledgeList /> },
    { path: "/instances/:instanceId/field/availability", element: <FieldAvailability /> },
  ] },

{ element: <ProtectedRoute requireInstance><RequesterPortalShell /></ProtectedRoute>, children: [
    { path: "/instances/:instanceId/portal", element: <PortalHome /> },
    { path: "/instances/:instanceId/portal/home", element: <PortalHome /> },
    { path: "/instances/:instanceId/portal/help", element: <GetHelp /> },
    { path: "/instances/:instanceId/portal/catalog", element: <CatalogBrowse /> },
    { path: "/instances/:instanceId/portal/catalog/:itemId", element: <CatalogItem /> },
    { path: "/instances/:instanceId/portal/cart", element: <CartPage /> },
    { path: "/instances/:instanceId/portal/checkout", element: <CheckoutPage /> },
    { path: "/instances/:instanceId/portal/requests", element: <MyRequests /> },
    { path: "/instances/:instanceId/portal/requests/:reqId", element: <RequestDetail /> },
    { path: "/instances/:instanceId/portal/my-incidents", element: <MyIncidents /> },
    { path: "/instances/:instanceId/portal/incidents/:id", element: <IncidentDetail /> },
    { path: "/instances/:instanceId/portal/knowledge", element: <KnowledgeSearch /> },
    { path: "/instances/:instanceId/portal/knowledge/:articleId", element: <KnowledgeArticle /> },
    { path: "/instances/:instanceId/portal/approvals", element: <PortalApprovals /> },
    { path: "/instances/:instanceId/portal/appointments", element: <PlatformHomePage /> },
  ] },

{ element: <ProtectedRoute><SaaSShell /></ProtectedRoute>, children: [
    { path: "/saas/overview", element: <PlatformOverviewPage /> },
    { path: "/saas/instances", element: <InstanceRegistryPage /> },
    { path: "/saas/instances/new", element: <PlatformHomePage /> },
    { path: "/saas/instances/:id", element: <PlatformHomePage /> },
    { path: "/saas/platform-users", element: <PlatformUsersPage /> },
    { path: "/saas/operators", element: <SaaSOperatorsPage /> },
    { path: "/saas/support-access", element: <SupportAccessPage /> },
    { path: "/saas/features", element: <FeaturesPage /> },
    { path: "/saas/jobs", element: <JobsPage /> },
    { path: "/saas/security", element: <SecurityPage /> },
    { path: "/saas/audit", element: <AuditPage /> },
  ] },

  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
]);
