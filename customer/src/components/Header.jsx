import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import { isEmployee } from '../lib/permissions.js';

export const Logo = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width="32" height="32" rx="4" fill="#fff" />
    <path d="M9 17l5 5 9-11" fill="none" stroke="#0b5d8e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon"><Logo /></div>
            <div className="logo-title">
              Support Center
              <small>Help Desk &amp; Knowledgebase</small>
            </div>
          </div>
        </div>
      </header>
      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-links">
            <NavLink to="/open" end>Open New Ticket</NavLink>
            <NavLink to="/status" end>Check Ticket Status</NavLink>
            <NavLink to="/kb" end>Knowledgebase</NavLink>
            {user && <NavLink to="/tickets" end>My Tickets</NavLink>}
            {user && !isEmployee(user) && <NavLink to="/employees" end>Employees</NavLink>}
          </div>
          <div className="nav-user">
            {user ? (
              <>
                <NotificationBell />
                <span>
                  Welcome, <strong>{user.name}</strong>
                </span>
                <Link to="/profile">Profile</Link>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sign Out</a>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
