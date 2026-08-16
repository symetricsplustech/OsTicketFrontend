import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';
import { en } from '../lib/enterprise.js';

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [three60, setThree60] = useState(null);
  const [fortLoading, setFortLoading] = useState(true);

  useEffect(() => {
    api.get(`/agent/users/${id}`).then(({ data }) => setData(data)).catch((err) => setError(err.message));
    en.customer360(id).then(setThree60).catch(() => { /* optional */ }).finally(() => setFortLoading(false));
  }, [id]);

  if (error) return <div className="box"><div className="alert error">{error}</div></div>;
  if (!data) return <div className="box muted">Loading…</div>;

  const { user, tickets } = data;

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>User: {user.name}</h1></div>
        <table className="list" style={{ maxWidth: 560 }}>
          <tbody>
            <tr><th style={{ width: 150 }}>Name</th><td>{user.name}</td></tr>
            <tr><th>Email</th><td>{user.email}</td></tr>
            <tr><th>Phone</th><td>{user.phone || '—'}</td></tr>
            <tr><th>Organization</th><td>{user.organization?.name || '—'}</td></tr>
            <tr><th>Registered</th><td>{user.isRegistered ? 'Yes' : 'Guest'}</td></tr>
            <tr><th>Email Confirmed</th><td>{user.emailConfirmed ? 'Yes' : 'No'}</td></tr>
            <tr><th>Last Login</th><td>{formatDateTime(user.lastLogin)}</td></tr>
            <tr><th>Joined</th><td>{formatDateTime(user.createdAt)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="box">
        <div className="box-header"><h1>Tickets ({tickets.length})</h1></div>
        <table className="list">
          <thead><tr><th>Number</th><th>Subject</th><th>Status</th><th>Priority</th><th>Dept</th><th>Assigned To</th><th>Updated</th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td><Link to={`/agent/tickets/${t.number}`}>#{t.number}</Link></td>
                <td><Link to={`/agent/tickets/${t.number}`}>{t.subject}</Link></td>
                <td><span className="pill" style={{ background: STATUS_COLORS[t.status] || '#95a5a6' }}>{t.status}</span></td>
                <td><span className={`pill priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                <td>{t.dept?.name || '—'}</td>
                <td>{t.agent?.name || '—'}</td>
                <td>{formatDateTime(t.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="box">
        <div className="box-header"><h1>🧭 Customer 360</h1></div>
        {fortLoading && <div className="muted">Loading profile…</div>}
        {three60 && (
          <div className="et-stack">
            <div className="stat-cards">
              <div className="stat-card"><div className="muted">Health score</div><div className="stat-num">{three60.healthScore != null ? three60.healthScore : '—'}</div></div>
              <div className="stat-card"><div className="muted">Open tickets</div><div className="stat-num">{(three60.tickets || []).filter((t) => !['closed', 'archived'].includes(t.status)).length}</div></div>
              <div className="stat-card"><div className="muted">Overdue</div><div className="stat-num">{(three60.tickets || []).filter((t) => t.isOverdue).length}</div></div>
              <div className="stat-card"><div className="muted">Total tickets</div><div className="stat-num">{(three60.tickets || []).length}</div></div>
            </div>
            {three60.tier && <div><strong>Tier:</strong> <span className="pill">{three60.tier}</span></div>}
            {three60.risk && <div className="et-row"><span className={`pill ${three60.risk === 'high' ? 'et-h' : 'et-m'}`}>Churn risk: {three60.risk}</span></div>}
            {three60.contracts?.length > 0 && (
              <>
                <h4>Contracts</h4>
                {three60.contracts.map((c, i) => <div key={i} className="et-row">{c.number} — {c.name} <span className="pill">{c.status}</span> ends {c.endDate ? formatDateTime(c.endDate) : '—'}</div>)}
              </>
            )}
            <h4>Recent interactions</h4>
            {(three60.tickets || []).slice(0, 5).map((t) => (
              <div key={t._id} className="et-row">
                <Link to={`/agent/tickets/${t.number}`}>#{t.number}</Link> — {t.subject} <span className="muted small">{t.priority} · {t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
