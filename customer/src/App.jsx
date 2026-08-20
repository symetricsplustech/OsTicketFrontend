import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import OpenTicket from './pages/OpenTicket.jsx';
import CheckStatus from './pages/CheckStatus.jsx';
import MyTickets from './pages/MyTickets.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Knowledgebase from './pages/Knowledgebase.jsx';
import FaqDetail from './pages/FaqDetail.jsx';
import Employees from './pages/Employees.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import ServiceCatalog from './pages/ServiceCatalog.jsx';
import StatusPage from './pages/StatusPage.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Protected from './components/Protected.jsx';

import AgentLayout from './agent/components/Layout.jsx';
import AgentDashboard from './agent/pages/Dashboard.jsx';
import AgentTicketList from './agent/pages/TicketList.jsx';
import AgentNewTicket from './agent/pages/NewTicket.jsx';
import AgentTicketDetail from './agent/pages/TicketDetail.jsx';
import AgentEscalations from './agent/pages/Escalations.jsx';
import AgentUsers from './agent/pages/Users.jsx';
import AgentUserDetail from './agent/pages/UserDetail.jsx';
import AgentOrganizations from './agent/pages/Organizations.jsx';
import AgentKbManage from './agent/pages/KbManage.jsx';
import AgentDirectory from './agent/pages/Directory.jsx';
import AgentProfile from './agent/pages/Profile.jsx';
import AgentNotifications from './agent/pages/Notifications.jsx';
import AgentSearch from './agent/pages/Search.jsx';
import AgentIncidents from './agent/pages/Incidents.jsx';
import AgentProblems from './agent/pages/Problems.jsx';
import AgentChanges from './agent/pages/Changes.jsx';
import AgentAssets from './agent/pages/Assets.jsx';
import AgentApprovals from './agent/pages/Approvals.jsx';
import AgentChatInbox from './agent/pages/ChatInbox.jsx';
import AgentReports from './agent/pages/Reports.jsx';

import AdminLayout from './admin/components/Layout.jsx';
import AdminDashboard from './admin/pages/Dashboard.jsx';
import SystemLogs from './admin/pages/SystemLogs.jsx';
import AdminSettings from './admin/pages/Settings.jsx';
import TicketSettings from './admin/pages/TicketSettings.jsx';
import CompanySettings from './admin/pages/CompanySettings.jsx';
import HelpTopics from './admin/pages/HelpTopics.jsx';
import SlaPlans from './admin/pages/SlaPlans.jsx';
import Priorities from './admin/pages/Priorities.jsx';
import Filters from './admin/pages/Filters.jsx';
import AdminKb from './admin/pages/AdminKb.jsx';
import AdminCanned from './admin/pages/AdminCanned.jsx';
import AdminAnnouncements from './admin/pages/AdminAnnouncements.jsx';
import AdminUsers from './admin/pages/AdminUsers.jsx';
import AdminOrgs from './admin/pages/AdminOrgs.jsx';
import EmailTemplates from './admin/pages/EmailTemplates.jsx';
import Agents from './admin/pages/Agents.jsx';
import Teams from './admin/pages/Teams.jsx';
import Roles from './admin/pages/Roles.jsx';
import Departments from './admin/pages/Departments.jsx';
import AdminEscalations from './admin/pages/Escalations.jsx';
import AdminNotifications from './admin/pages/Notifications.jsx';
import AdminTicketDetail from './admin/pages/TicketDetail.jsx';
import TicketStatuses from './admin/pages/TicketStatuses.jsx';
import AdminCustomFields from './admin/pages/CustomFields.jsx';
import TicketForms from './admin/pages/TicketForms.jsx';
import EmailSettings from './admin/pages/EmailSettings.jsx';
import Autoresponders from './admin/pages/Autoresponders.jsx';
import Alerts from './admin/pages/Alerts.jsx';
import Schedules from './admin/pages/Schedules.jsx';
import Holidays from './admin/pages/Holidays.jsx';
import Integrations from './admin/pages/Integrations.jsx';
import AdminAuthentication from './admin/pages/Authentication.jsx';
import Workflows from './admin/pages/Workflows.jsx';
import Skills from './admin/pages/Skills.jsx';
import Contracts from './admin/pages/Contracts.jsx';
import StatusPages from './admin/pages/StatusPages.jsx';
import Surveys from './admin/pages/Surveys.jsx';
import Webhooks from './admin/pages/Webhooks.jsx';
import ApiKeys from './admin/pages/ApiKeys.jsx';
import AuditLogs from './admin/pages/AuditLogs.jsx';
import Realtime from './admin/pages/Realtime.jsx';

import SuperAdminLayout from './superadmin/components/Layout.jsx';
import SuperAdminDashboard from './superadmin/pages/Dashboard.jsx';
import Companies from './superadmin/pages/Companies.jsx';
import CompanyDetail from './superadmin/pages/CompanyDetail.jsx';
import SuperAdminPlans from './superadmin/pages/Plans.jsx';
import SuperAdminInvoices from './superadmin/pages/Invoices.jsx';
import SuperAdminAuditLogs from './superadmin/pages/AuditLogs.jsx';
import SuperAdmins from './superadmin/pages/Admins.jsx';
import SuperAdminSettings from './superadmin/pages/Settings.jsx';
import SuperAdminNotifications from './superadmin/pages/Notifications.jsx';

function Shell() {
  return (
    <>
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* === Customer Portal (root) === */}
      <Route element={<Protected />}>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/open" element={<OpenTicket />} />
          <Route path="/status" element={<CheckStatus />} />
          <Route path="/kb" element={<Knowledgebase />} />
          <Route path="/kb/:id" element={<FaqDetail />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/ticket/:number" element={<TicketDetail />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/catalog" element={<ServiceCatalog />} />
        </Route>
      </Route>

      {/* === Agent Portal (/agent) === */}
      <Route element={<Protected minRole="agent" />}>
        <Route element={<AgentLayout />}>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/tickets" element={<AgentTicketList />} />
          <Route path="/agent/tickets/new" element={<AgentNewTicket />} />
          <Route path="/agent/tickets/:number" element={<AgentTicketDetail />} />
          <Route path="/agent/escalations" element={<AgentEscalations />} />
          <Route path="/agent/users" element={<AgentUsers />} />
          <Route path="/agent/users/:id" element={<AgentUserDetail />} />
          <Route path="/agent/orgs" element={<AgentOrganizations />} />
          <Route path="/agent/kb" element={<AgentKbManage />} />
          <Route path="/agent/directory" element={<AgentDirectory />} />
          <Route path="/agent/profile" element={<AgentProfile />} />
          <Route path="/agent/notifications" element={<AgentNotifications />} />
          <Route path="/agent/search" element={<AgentSearch />} />
          <Route path="/agent/incidents" element={<AgentIncidents />} />
          <Route path="/agent/problems" element={<AgentProblems />} />
          <Route path="/agent/changes" element={<AgentChanges />} />
          <Route path="/agent/assets" element={<AgentAssets />} />
          <Route path="/agent/approvals" element={<AgentApprovals />} />
          <Route path="/agent/chat" element={<AgentChatInbox />} />
          <Route path="/agent/reports" element={<AgentReports />} />
        </Route>
      </Route>

      {/* === Admin Portal (/admin) === */}
      <Route element={<Protected minRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/logs" element={<SystemLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/settings/tickets" element={<TicketSettings />} />
          <Route path="/admin/settings/company" element={<CompanySettings />} />
          <Route path="/admin/settings/email" element={<EmailSettings />} />
          <Route path="/admin/settings/autoresponder" element={<Autoresponders />} />
          <Route path="/admin/settings/alerts" element={<Alerts />} />
          <Route path="/admin/settings/schedules" element={<Schedules />} />
          <Route path="/admin/settings/auth" element={<AdminAuthentication />} />
          <Route path="/admin/help-topics" element={<HelpTopics />} />
          <Route path="/admin/sla-plans" element={<SlaPlans />} />
          <Route path="/admin/priorities" element={<Priorities />} />
          <Route path="/admin/filters" element={<Filters />} />
          <Route path="/admin/kb" element={<AdminKb />} />
          <Route path="/admin/canned" element={<AdminCanned />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orgs" element={<AdminOrgs />} />
          <Route path="/admin/email-templates" element={<EmailTemplates />} />
          <Route path="/admin/agents" element={<Agents />} />
          <Route path="/admin/teams" element={<Teams />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/escalations" element={<AdminEscalations />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/tickets/:number" element={<AdminTicketDetail />} />
          <Route path="/admin/ticket-statuses" element={<TicketStatuses />} />
          <Route path="/admin/custom-fields" element={<AdminCustomFields />} />
          <Route path="/admin/ticket-forms" element={<TicketForms />} />
          <Route path="/admin/holidays" element={<Holidays />} />
          <Route path="/admin/integrations" element={<Integrations />} />
          <Route path="/admin/enterprise/workflows" element={<Workflows />} />
          <Route path="/admin/enterprise/skills" element={<Skills />} />
          <Route path="/admin/enterprise/contracts" element={<Contracts />} />
          <Route path="/admin/enterprise/status-pages" element={<StatusPages />} />
          <Route path="/admin/enterprise/surveys" element={<Surveys />} />
          <Route path="/admin/enterprise/webhooks" element={<Webhooks />} />
          <Route path="/admin/enterprise/api-keys" element={<ApiKeys />} />
          <Route path="/admin/enterprise/audit" element={<AuditLogs />} />
          <Route path="/admin/enterprise/realtime" element={<Realtime />} />
        </Route>
      </Route>

      {/* === Super Admin Portal (/superadmin) === */}
      <Route element={<Protected minRole="superadmin" />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/companies" element={<Companies />} />
          <Route path="/superadmin/companies/:id" element={<CompanyDetail />} />
          <Route path="/superadmin/plans" element={<SuperAdminPlans />} />
          <Route path="/superadmin/invoices" element={<SuperAdminInvoices />} />
          <Route path="/superadmin/audit-logs" element={<SuperAdminAuditLogs />} />
          <Route path="/superadmin/admins" element={<SuperAdmins />} />
          <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
          <Route path="/superadmin/notifications" element={<SuperAdminNotifications />} />
        </Route>
      </Route>

      {/* === Public status page === */}
      <Route path="/status/:slug" element={<StatusPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
