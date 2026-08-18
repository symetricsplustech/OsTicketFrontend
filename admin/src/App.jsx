import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Protected from './components/Protected.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SystemLogs from './pages/SystemLogs.jsx';
import Settings from './pages/Settings.jsx';
import TicketSettings from './pages/TicketSettings.jsx';
import CompanySettings from './pages/CompanySettings.jsx';
import HelpTopics from './pages/HelpTopics.jsx';
import SlaPlans from './pages/SlaPlans.jsx';
import Priorities from './pages/Priorities.jsx';
import Filters from './pages/Filters.jsx';
import AdminKb from './pages/AdminKb.jsx';
import AdminCanned from './pages/AdminCanned.jsx';
import AdminAnnouncements from './pages/AdminAnnouncements.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminOrgs from './pages/AdminOrgs.jsx';
import EmailTemplates from './pages/EmailTemplates.jsx';
import Agents from './pages/Agents.jsx';
import Teams from './pages/Teams.jsx';
import Roles from './pages/Roles.jsx';
import Departments from './pages/Departments.jsx';
import Escalations from './pages/Escalations.jsx';
import Notifications from './pages/Notifications.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import TicketStatuses from './pages/TicketStatuses.jsx';
import CustomFields from './pages/CustomFields.jsx';
import TicketForms from './pages/TicketForms.jsx';
import EmailSettings from './pages/EmailSettings.jsx';
import Autoresponders from './pages/Autoresponders.jsx';
import Alerts from './pages/Alerts.jsx';
import Schedules from './pages/Schedules.jsx';
import Holidays from './pages/Holidays.jsx';
import Integrations from './pages/Integrations.jsx';
import Authentication from './pages/Authentication.jsx';
import Workflows from './pages/Workflows.jsx';
import Skills from './pages/Skills.jsx';
import Contracts from './pages/Contracts.jsx';
import StatusPages from './pages/StatusPages.jsx';
import Surveys from './pages/Surveys.jsx';
import Webhooks from './pages/Webhooks.jsx';
import ApiKeys from './pages/ApiKeys.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Realtime from './pages/Realtime.jsx';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route element={<Protected superAdminOnly={false} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/logs" element={<SystemLogs />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/settings/tickets" element={<TicketSettings />} />
              <Route path="/admin/settings/company" element={<CompanySettings />} />
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
              <Route path="/admin/escalations" element={<Escalations />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/tickets/:number" element={<TicketDetail />} />
              <Route path="/admin/ticket-statuses" element={<TicketStatuses />} />
              <Route path="/admin/custom-fields" element={<CustomFields />} />
              <Route path="/admin/ticket-forms" element={<TicketForms />} />
              <Route path="/admin/settings/email" element={<EmailSettings />} />
              <Route path="/admin/settings/autoresponder" element={<Autoresponders />} />
              <Route path="/admin/settings/alerts" element={<Alerts />} />
              <Route path="/admin/settings/schedules" element={<Schedules />} />
              <Route path="/admin/settings/auth" element={<Authentication />} />
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
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </I18nProvider>
    </AuthProvider>
  );
}