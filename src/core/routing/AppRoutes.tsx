import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@core/layout/Layout';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import { AdminRoute, PlatformRoute, ProtectedRoute } from '@core/routing/RouteGuards';
import { LoadingSpinner } from '@shared/components/ui';

const Login = lazy(() => import('@core/auth/Login'));
const Register = lazy(() => import('@core/auth/Register'));

// Helpdesk
const Dashboard = lazy(() => import('@modules/helpdesk/pages/dashboard/Dashboard'));
const TicketList = lazy(() => import('@modules/helpdesk/pages/tickets/TicketList'));
const NewTicket = lazy(() => import('@modules/helpdesk/pages/tickets/NewTicket'));
const TicketDetail = lazy(() => import('@modules/helpdesk/pages/tickets/TicketDetail'));
const TicketCrud = lazy(() => import('@modules/helpdesk/pages/tickets/TicketCrud'));
const TicketBoard = lazy(() => import('@modules/helpdesk/pages/tickets/TicketBoard'));
const TicketTemplates = lazy(() => import('@modules/helpdesk/pages/tickets/TicketTemplates'));
const Requests = lazy(() => import('@modules/helpdesk/pages/tickets/Requests'));
const AssignmentRouting = lazy(() => import('@modules/helpdesk/pages/tickets/AssignmentRouting'));
const Incidents = lazy(() => import('@modules/helpdesk/pages/incidents/Incidents'));
const IncidentCrud = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentCrud'));
const MajorIncidents = lazy(() => import('@modules/helpdesk/pages/incidents/MajorIncidents'));
const Escalations = lazy(() => import('@modules/helpdesk/pages/incidents/Escalations'));
const SlaMonitor = lazy(() => import('@modules/helpdesk/pages/incidents/SlaMonitor'));
const OutageTracking = lazy(() => import('@modules/helpdesk/pages/incidents/OutageTracking'));
const WarRoom = lazy(() => import('@modules/helpdesk/pages/incidents/WarRoom'));
const IncidentDiagnosis = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentDiagnosis'));
const IncidentPlaybooks = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentPlaybooks'));
const PostImplReviews = lazy(() => import('@modules/helpdesk/pages/incidents/PostImplReviews'));
const PriorityMatrixEditor = lazy(() => import('@modules/helpdesk/pages/incidents/PriorityMatrixEditor'));
const AuditTrail = lazy(() => import('@modules/helpdesk/pages/incidents/AuditTrail'));
const Alerts = lazy(() => import('@modules/helpdesk/pages/incidents/Alerts'));
const IncidentRecord = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentRecord'));
const IncidentTriage = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentTriage'));
const IncidentCIRelated = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentCIRelated'));
const IncidentRelatedIncidents = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentRelatedIncidents'));
const SlaTimeline = lazy(() => import('@modules/helpdesk/pages/incidents/SlaTimeline'));
const IncidentDashboard = lazy(() => import('@modules/helpdesk/pages/incidents/IncidentDashboard'));
const Problems = lazy(() => import('@modules/helpdesk/pages/problems/Problems'));
const ProblemCrud = lazy(() => import('@modules/helpdesk/pages/problems/ProblemCrud'));
const ProblemRecord = lazy(() => import('@modules/helpdesk/pages/problems/ProblemRecord'));
const ProblemDashboard = lazy(() => import('@modules/helpdesk/pages/problems/ProblemDashboard'));
const Changes = lazy(() => import('@modules/helpdesk/pages/changes/Changes'));
const ChangeCrud = lazy(() => import('@modules/helpdesk/pages/changes/ChangeCrud'));
const ChangeCalendarPage = lazy(() => import('@modules/helpdesk/pages/changes/ChangeCalendarPage'));
const KnowledgeBase = lazy(() => import('@modules/helpdesk/pages/dashboard/KnowledgeBase'));
const KnowledgeInsights = lazy(() => import('@modules/helpdesk/pages/dashboard/KnowledgeInsights'));
const NeuralSearch = lazy(() => import('@modules/helpdesk/pages/knowledge/NeuralSearch'));
const ServiceCatalog = lazy(() => import('@modules/helpdesk/pages/support/ServiceCatalog'));
const MyWork = lazy(() => import('@modules/helpdesk/pages/support/MyWork'));
const CabBoard = lazy(() => import('@modules/helpdesk/pages/support/CabBoard'));
const OnCallSchedules = lazy(() => import('@modules/helpdesk/pages/support/OnCallSchedules'));
const ShiftHandover = lazy(() => import('@modules/helpdesk/pages/support/ShiftHandover'));
const SupportEmail = lazy(() => import('@modules/helpdesk/pages/support/SupportEmail'));
const OpsWorkspace = lazy(() => import('@modules/helpdesk/pages/support/OpsWorkspace'));
const Otto = lazy(() => import('@modules/helpdesk/pages/support/Otto'));
const Assets = lazy(() => import('@modules/helpdesk/pages/assets/Assets'));
const AssetDetail = lazy(() => import('@modules/helpdesk/pages/assets/AssetDetail'));
const HelpdeskReports = lazy(() => import('@modules/helpdesk/pages/reports/HelpdeskReports'));
const CsatDashboard = lazy(() => import('@modules/helpdesk/pages/reports/CsatDashboard'));
const KnownErrors = lazy(() => import('@modules/helpdesk/pages/reports/KnownErrors'));
const HelpdeskAdmin = lazy(() => import('@modules/helpdesk/pages/admin/HelpdeskAdmin'));
const CMDBImpact = lazy(() => import('@modules/helpdesk/pages/misc/CMDBImpact'));

// Settings (helpdesk admin)
const Settings = lazy(() => import('@modules/settings/pages/Settings'));
const Users = lazy(() => import('@modules/settings/pages/Users'));
const Teams = lazy(() => import('@modules/settings/pages/Teams'));
const Roles = lazy(() => import('@modules/settings/pages/Roles'));
const AccessControl = lazy(() => import('@modules/settings/pages/AccessControl'));
const Departments = lazy(() => import('@modules/settings/pages/Departments'));
const SlaPlans = lazy(() => import('@modules/settings/pages/SlaPlans'));
const EmailSettings = lazy(() => import('@modules/settings/pages/EmailSettings'));
const AuditLogs = lazy(() => import('@modules/settings/pages/AuditLogs'));

// Super Admin (SaaS platform)
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

// Core Task Engine
const TaskListPage = lazy(() => import('@modules/tasks/pages/TaskList'));
const TaskDetailPage = lazy(() => import('@modules/tasks/pages/TaskDetail'));
const TaskCreatePage = lazy(() => import('@modules/tasks/pages/TaskCreate'));
const MyWorkPage = lazy(() => import('@modules/tasks/pages/MyWork'));
const GroupQueuesPage = lazy(() => import('@modules/tasks/pages/GroupQueues'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />

          {/* Helpdesk Tickets */}
          <Route path="tickets" element={<ModuleGuard module="helpdesk"><TicketList /></ModuleGuard>} />
          <Route path="tickets/new" element={<ModuleGuard module="helpdesk"><NewTicket /></ModuleGuard>} />
          <Route path="tickets/manage" element={<ModuleGuard module="helpdesk"><TicketCrud /></ModuleGuard>} />
          <Route path="tickets/:number" element={<ModuleGuard module="helpdesk"><TicketDetail /></ModuleGuard>} />
          <Route path="ticket-board" element={<ModuleGuard module="helpdesk"><TicketBoard /></ModuleGuard>} />
          <Route path="templates" element={<ModuleGuard module="helpdesk"><TicketTemplates /></ModuleGuard>} />
          <Route path="requests" element={<ModuleGuard module="helpdesk"><Requests /></ModuleGuard>} />
          <Route path="assignment" element={<ModuleGuard module="helpdesk"><AssignmentRouting /></ModuleGuard>} />
          <Route path="my-work" element={<ModuleGuard module="helpdesk"><MyWork /></ModuleGuard>} />

          {/* Helpdesk Incidents */}
          <Route path="incidents" element={<ModuleGuard module="helpdesk"><Incidents /></ModuleGuard>} />
          <Route path="incidents-crud" element={<ModuleGuard module="helpdesk"><IncidentCrud /></ModuleGuard>} />
          <Route path="major-incidents" element={<ModuleGuard module="helpdesk"><MajorIncidents /></ModuleGuard>} />
          <Route path="escalations" element={<ModuleGuard module="helpdesk"><Escalations /></ModuleGuard>} />
          <Route path="sla-monitor" element={<ModuleGuard module="helpdesk"><SlaMonitor /></ModuleGuard>} />
          <Route path="outages" element={<ModuleGuard module="helpdesk"><OutageTracking /></ModuleGuard>} />
          <Route path="warroom" element={<ModuleGuard module="helpdesk"><WarRoom /></ModuleGuard>} />
          <Route path="diagnosis" element={<ModuleGuard module="helpdesk"><IncidentDiagnosis /></ModuleGuard>} />
          <Route path="playbooks" element={<ModuleGuard module="helpdesk"><IncidentPlaybooks /></ModuleGuard>} />
          <Route path="pir" element={<ModuleGuard module="helpdesk"><PostImplReviews /></ModuleGuard>} />
          <Route path="priority-matrix" element={<ModuleGuard module="helpdesk"><PriorityMatrixEditor /></ModuleGuard>} />
          <Route path="audit-trail" element={<ModuleGuard module="helpdesk"><AuditTrail /></ModuleGuard>} />
          <Route path="alert-manager" element={<ModuleGuard module="helpdesk"><Alerts /></ModuleGuard>} />
          <Route path="incidents/:id" element={<ModuleGuard module="helpdesk"><IncidentRecord /></ModuleGuard>} />
          <Route path="incidents/triage" element={<ModuleGuard module="helpdesk"><IncidentTriage /></ModuleGuard>} />
          <Route path="incidents/:id/cis" element={<ModuleGuard module="helpdesk"><IncidentCIRelated /></ModuleGuard>} />
          <Route path="incidents/:id/related" element={<ModuleGuard module="helpdesk"><IncidentRelatedIncidents /></ModuleGuard>} />
          <Route path="incidents/:id/sla" element={<ModuleGuard module="helpdesk"><SlaTimeline /></ModuleGuard>} />
          <Route path="incident-dashboard" element={<ModuleGuard module="helpdesk"><IncidentDashboard /></ModuleGuard>} />

          {/* Helpdesk Problems */}
          <Route path="problems" element={<ModuleGuard module="helpdesk"><Problems /></ModuleGuard>} />
          <Route path="problems-crud" element={<ModuleGuard module="helpdesk"><ProblemCrud /></ModuleGuard>} />
          <Route path="problems/:id" element={<ModuleGuard module="helpdesk"><ProblemRecord /></ModuleGuard>} />
          <Route path="problem-dashboard" element={<ModuleGuard module="helpdesk"><ProblemDashboard /></ModuleGuard>} />

          {/* Helpdesk Changes */}
          <Route path="changes" element={<ModuleGuard module="helpdesk"><Changes /></ModuleGuard>} />
          <Route path="changes-crud" element={<ModuleGuard module="helpdesk"><ChangeCrud /></ModuleGuard>} />
          <Route path="change-calendar" element={<ModuleGuard module="helpdesk"><ChangeCalendarPage /></ModuleGuard>} />
          <Route path="cab" element={<ModuleGuard module="helpdesk"><CabBoard /></ModuleGuard>} />

          {/* Helpdesk Knowledge */}
          <Route path="kb" element={<ModuleGuard module="helpdesk"><KnowledgeBase /></ModuleGuard>} />
          <Route path="knowledge-insights" element={<ModuleGuard module="helpdesk"><KnowledgeInsights /></ModuleGuard>} />
          <Route path="neural-search" element={<ModuleGuard module="helpdesk"><NeuralSearch /></ModuleGuard>} />
          <Route path="known-errors" element={<ModuleGuard module="helpdesk"><KnownErrors /></ModuleGuard>} />

          {/* Helpdesk Support */}
          <Route path="catalog" element={<ModuleGuard module="helpdesk"><ServiceCatalog /></ModuleGuard>} />
          <Route path="oncall" element={<ModuleGuard module="helpdesk"><OnCallSchedules /></ModuleGuard>} />
          <Route path="shift-handover" element={<ModuleGuard module="helpdesk"><ShiftHandover /></ModuleGuard>} />
          <Route path="support-email" element={<ProtectedRoute><SupportEmail /></ProtectedRoute>} />
          <Route path="ops-workspace" element={<ModuleGuard module="helpdesk"><OpsWorkspace /></ModuleGuard>} />
          <Route path="otto" element={<ModuleGuard module="helpdesk"><Otto /></ModuleGuard>} />
          <Route path="cmdb-impact" element={<ModuleGuard module="helpdesk"><CMDBImpact /></ModuleGuard>} />

          {/* Helpdesk Assets */}
          <Route path="assets" element={<ModuleGuard module="helpdesk"><Assets /></ModuleGuard>} />
          <Route path="assets/:id" element={<ModuleGuard module="helpdesk"><AssetDetail /></ModuleGuard>} />

          {/* Helpdesk Reports */}
          <Route path="helpdesk-reports" element={<ModuleGuard module="helpdesk"><HelpdeskReports /></ModuleGuard>} />
          <Route path="csat" element={<ModuleGuard module="helpdesk"><CsatDashboard /></ModuleGuard>} />

          {/* Core Task Engine */}
          <Route path="tasks" element={<ModuleGuard module="helpdesk"><TaskListPage /></ModuleGuard>} />
          <Route path="tasks/new" element={<ModuleGuard module="helpdesk"><TaskCreatePage /></ModuleGuard>} />
          <Route path="tasks/:id" element={<ModuleGuard module="helpdesk"><TaskDetailPage /></ModuleGuard>} />
          <Route path="my-work" element={<ModuleGuard module="helpdesk"><MyWorkPage /></ModuleGuard>} />
          <Route path="group-queues" element={<ModuleGuard module="helpdesk"><GroupQueuesPage /></ModuleGuard>} />

          {/* Helpdesk Admin */}
          <Route path="helpdesk-admin" element={<ModuleGuard module="helpdesk"><HelpdeskAdmin /></ModuleGuard>} />

          {/* Settings (helpdesk admin) */}
          <Route path="settings" element={<AdminRoute><ModuleGuard module="settings"><Settings /></ModuleGuard></AdminRoute>} />
          <Route path="settings/users" element={<AdminRoute><ModuleGuard module="settings"><Users /></ModuleGuard></AdminRoute>} />
          <Route path="settings/teams" element={<AdminRoute><ModuleGuard module="settings"><Teams /></ModuleGuard></AdminRoute>} />
          <Route path="settings/roles" element={<AdminRoute><ModuleGuard module="settings"><Roles /></ModuleGuard></AdminRoute>} />
          <Route path="settings/access" element={<AdminRoute><ModuleGuard module="settings"><AccessControl /></ModuleGuard></AdminRoute>} />
          <Route path="settings/departments" element={<AdminRoute><ModuleGuard module="settings"><Departments /></ModuleGuard></AdminRoute>} />
          <Route path="settings/sla" element={<AdminRoute><ModuleGuard module="settings"><SlaPlans /></ModuleGuard></AdminRoute>} />
          <Route path="settings/email" element={<AdminRoute><ModuleGuard module="settings"><EmailSettings /></ModuleGuard></AdminRoute>} />
          <Route path="settings/audit" element={<AdminRoute><ModuleGuard module="settings"><AuditLogs /></ModuleGuard></AdminRoute>} />

          {/* Super Admin (SaaS platform) */}
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
