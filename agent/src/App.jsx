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

export default function App() {
  return (
    <Routes>
      <Route path="/agent/login" element={<Login />} />
      <Route element={<Protected />}>
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
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/agent" replace />} />
    </Routes>
  );
}
