import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/index.js';

export const AdminLogo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width="32" height="32" rx="4" fill="#fff" />
    <path d="M9 17l5 5 9-11" fill="none" stroke="#0b5d8e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Sections = [
  {
    title: 'Overview',
    links: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/notifications', label: 'Notifications' },
      { to: '/admin/logs', label: 'System Logs' },
    ],
  },
  {
    title: 'Settings',
    links: [
      { to: '/admin/settings', label: 'System Settings' },
      { to: '/admin/settings/tickets', label: 'Ticket Settings' },
      { to: '/admin/settings/email', label: 'Email / SMTP' },
      { to: '/admin/settings/autoresponder', label: 'Autoresponders' },
      { to: '/admin/settings/alerts', label: 'Alerts & Notices' },
      { to: '/admin/settings/schedules', label: 'Schedules / Business Hours' },
      { to: '/admin/settings/auth', label: 'Authentication' },
      { to: '/admin/settings/company', label: 'Company Settings' },
    ],
  },
  {
    title: 'Manage',
    links: [
      { to: '/admin/help-topics', label: 'Help Topics' },
      { to: '/admin/sla-plans', label: 'SLA Plans' },
      { to: '/admin/ticket-statuses', label: 'Ticket Statuses' },
      { to: '/admin/ticket-forms', label: 'Ticket Forms' },
      { to: '/admin/custom-fields', label: 'Custom Fields' },
      { to: '/admin/holidays', label: 'Holidays' },
      { to: '/admin/integrations', label: 'Plugins & Integrations' },
      { to: '/admin/filters', label: 'Ticket Routing / Filters' },
      { to: '/admin/escalations', label: 'Escalation Rules' },
      { to: '/admin/kb', label: 'Knowledgebase' },
      { to: '/admin/canned', label: 'Canned Responses' },
      { to: '/admin/announcements', label: 'Announcements' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/orgs', label: 'Organizations' },
    ],
  },
  {
    title: 'Emails',
    links: [
      { to: '/admin/email-templates', label: 'Email Templates' },
    ],
  },
  {
    title: 'Agents',
    links: [
      { to: '/admin/agents', label: 'Agents' },
      { to: '/admin/teams', label: 'Teams' },
      { to: '/admin/roles', label: 'Roles' },
      { to: '/admin/departments', label: 'Departments' },
    ],
  },
];

export default function Layout() {
  const { user, logout, unread } = useAuth();
  const navigate = useNavigate();
  const [autoAssign, setAutoAssign] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    api
      .get('/admin/settings')
      .then(({ data }) => setAutoAssign(data.settings?.tickets?.autoAssign !== false))
      .catch(() => {});
  }, []);

  const toggleAutoAssign = async (next) => {
    setAutoAssign(next);
    setSavedMsg('');
    try {
      await api.put('/admin/settings', { section: 'tickets', values: { autoAssign: next } });
      setSavedMsg('saved');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (err) {
      setAutoAssign(!next);
      setSavedMsg(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <AdminLogo />
            <div>
              Administrator Panel
              <small>osTicket MERN Help Desk</small>
            </div>
          </div>
          <div className="topbar-right">
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
                <NavLink key={l.to} to={l.to} end={l.to === '/admin'}>
                  {l.label}
                  {l.to === '/admin/notifications' && unread > 0 && <span className="badge sidebar-badge">{unread}</span>}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="sidebar-section sidebar-autoassign">
            <div className="sidebar-section-title">Quick Toggle</div>
            <div className="autoassign-row">
              <div>
                <div className="autoassign-label">Auto-Assign Tickets</div>
                <div className="autoassign-status">
                  <span className={`pill ${autoAssign ? 'green' : 'gray'}`}>{autoAssign ? 'ON' : 'OFF'}</span>
                  {savedMsg && <span className="autoassign-saved">{savedMsg}</span>}
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={autoAssign} onChange={(e) => toggleAutoAssign(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          </div>
        </aside>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
