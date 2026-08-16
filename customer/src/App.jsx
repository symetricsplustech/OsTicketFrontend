import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      <Route path="/status/:slug" element={<StatusPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
