import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const AgentLogo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width="32" height="32" rx="4" fill="#fff" />
    <path d="M9 17l5 5 9-11" fill="none" stroke="#0b5d8e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Layout() {
  const { user, logout, unread } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/agent/login');
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <AgentLogo />
            <div>
              Staff Control Panel
              <small>osTicket MERN Help Desk</small>
            </div>
          </div>
          <div className="topbar-right">
            <div className="agent-chip">
              <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
              <span>Welcome, <strong>{user?.name}</strong></span>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Log Out</a>
          </div>
        </div>
      </div>
      <nav className="tabs">
        <div className="tabs-inner">
          <NavLink to="/agent" end>Dashboard</NavLink>
          <NavLink to="/agent/users" end>Users</NavLink>
          <NavLink to="/agent/orgs" end>Organizations</NavLink>
          <NavLink to="/agent/tickets" end>Tickets</NavLink>
          <NavLink to="/agent/escalations" end>Escalations</NavLink>
          <NavLink to="/agent/kb" end>Knowledgebase</NavLink>
          <NavLink to="/agent/directory" end>Agent Directory</NavLink>
          <NavLink to="/agent/profile" end>My Profile</NavLink>
          {unread > 0 && <NavLink to="/agent/notifications" end>Notifications <span className="badge">{unread}</span></NavLink>}
        </div>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
