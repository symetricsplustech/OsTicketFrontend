import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Protected from './components/Protected.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TicketList from './pages/TicketList.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import NewTicket from './pages/NewTicket.jsx';
import Escalations from './pages/Escalations.jsx';
import Users from './pages/Users.jsx';
import UserDetail from './pages/UserDetail.jsx';
import Organizations from './pages/Organizations.jsx';
import KbManage from './pages/KbManage.jsx';
import Directory from './pages/Directory.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import Search from './pages/Search.jsx';
import Incidents from './pages/Incidents.jsx';
import Problems from './pages/Problems.jsx';
import Changes from './pages/Changes.jsx';
import Assets from './pages/Assets.jsx';
import Approvals from './pages/Approvals.jsx';
import ChatInbox from './pages/ChatInbox.jsx';
import Reports from './pages/Reports.jsx';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/agent/login" element={<Login />} />
        <Route element={<Protected superAdminOnly={false} />}>
          <Route element={<Layout />}>
            <Route path="/agent" element={<Dashboard />} />
            <Route path="/agent/tickets" element={<TicketList />} />
            <Route path="/agent/tickets/new" element={<NewTicket />} />
            <Route path="/agent/tickets/:number" element={<TicketDetail />} />
            <Route path="/agent/escalations" element={<Escalations />} />
            <Route path="/agent/users" element={<Users />} />
            <Route path="/agent/users/:id" element={<UserDetail />} />
            <Route path="/agent/orgs" element={<Organizations />} />
            <Route path="/agent/kb" element={<KbManage />} />
            <Route path="/agent/directory" element={<Directory />} />
            <Route path="/agent/profile" element={<Profile />} />
            <Route path="/agent/notifications" element={<Notifications />} />
            <Route path="/agent/search" element={<Search />} />
            <Route path="/agent/incidents" element={<Incidents />} />
            <Route path="/agent/problems" element={<Problems />} />
            <Route path="/agent/changes" element={<Changes />} />
            <Route path="/agent/assets" element={<Assets />} />
            <Route path="/agent/approvals" element={<Approvals />} />
            <Route path="/agent/chat" element={<ChatInbox />} />
            <Route path="/agent/reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/agent/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}