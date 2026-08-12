import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export const SuperAdminLogo = ({ size = 34 }) => (
  <div className="sa-shield" style={{ width: size, height: size }}>
    <svg width={size - 10} height={size - 10} viewBox="0 0 32 32">
      <path
        d="M16 2l11 4v9c0 8-4.8 13.6-11 15C9.8 28.6 5 23 5 15V6l11-4z"
        fill="#5a2586"
      />
      <path d="M10 15l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Sections = [
  {
    title: 'Platform',
    links: [
      { to: '/', label: 'Dashboard', end: true },
      { to: '/companies', label: 'Companies' },
      { to: '/plans', label: 'Billing Plans' },
      { to: '/invoices', label: 'Invoices' },
    ],
  },
  {
    title: 'Security',
    links: [
      { to: '/audit-logs', label: 'Audit Logs' },
      { to: '/admins', label: 'Super Admins' },
    ],
  },
  {
    title: 'System',
    links: [
      { to: '/settings', label: 'Platform Settings' },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <SuperAdminLogo />
            <div>
              Super Admin Panel
              <small>Multi-Tenant Control Center</small>
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <span>Welcome, <strong>{user?.name}</strong></span>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Log Out</a>
          </div>
        </div>
      </div>
      <div className="layout">
        <aside className="sidebar">
          {Sections.map((s) => (
            <div className="sidebar-section" key={s.title}>
              <div className="sidebar-section-title">{s.title}</div>
              {s.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
