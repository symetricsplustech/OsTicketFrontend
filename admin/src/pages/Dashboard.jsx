import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading…</div>;

  const { stats, latest } = data;

  const cards = [
    { lbl: 'Open', num: stats.open },
    { lbl: 'Assigned', num: stats.assigned },
    { lbl: 'Overdue', num: stats.overdue },
    { lbl: 'Closed', num: stats.closed },
    { lbl: 'Archived', num: stats.archived },
    { lbl: 'Total', num: stats.total },
    { lbl: 'Users', num: stats.users },
    { lbl: 'Agents', num: stats.agents },
    { lbl: 'Departments', num: stats.depts },
  ];

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>Dashboard</h1></div>
        <div className="stat-cards">
          {cards.map((c) => (
            <div className="stat-card" key={c.lbl}>
              <div className="num">{c.num}</div>
              <div className="lbl">{c.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="box">
        <div className="box-header"><h1>Active Tickets</h1></div>
        {latest.length === 0 ? <p className="muted">No active tickets.</p> : (
          <table className="list">
            <thead><tr><th>Number</th><th>Subject</th><th>User</th><th>Status</th><th>Priority</th><th>Dept</th><th>Agent</th><th>Updated</th></tr></thead>
            <tbody>
              {latest.map((t) => (
                <tr key={t._id}>
                  <td><Link to={`/admin/tickets/${t.number}`}>#{t.number}</Link></td>
                  <td><Link to={`/admin/tickets/${t.number}`}>{t.subject}</Link></td>
                  <td>{t.user?.name}</td>
                  <td><span className="pill" style={{ background: STATUS_COLORS[t.status] || '#95a5a6' }}>{t.status}</span></td>
                  <td><span className="pill" style={{ background: t.priority === 'Emergency' ? '#c0392b' : t.priority === 'High' ? '#e08a2e' : '#4a86b0' }}>{t.priority}</span></td>
                  <td>{t.dept?.name || '—'}</td>
                  <td>{t.agent?.name || '—'}</td>
                  <td>{formatDateTime(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
