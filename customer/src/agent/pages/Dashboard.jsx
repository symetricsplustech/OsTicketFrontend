import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/agent/dashboard').then(({ data }) => setData(data)).catch((err) => setError(err.message));
    api.get('/agent/workload').then(({ data }) => setWorkload(data.items)).catch(() => {});
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading dashboard…</div>;

  const { stats, latest } = data;

  const cards = [
    { lbl: 'Open Tickets', num: stats.open, to: '/agent/tickets?status=open' },
    { lbl: 'Assigned', num: stats.assigned, to: '/agent/tickets?status=assigned' },
    { lbl: 'Overdue', num: stats.overdue, to: '/agent/tickets?status=overdue' },
    { lbl: 'Closed', num: stats.closed, to: '/agent/tickets?status=closed' },
    { lbl: 'My Tickets', num: stats.mine, to: '/agent/tickets?status=mine' },
    { lbl: 'New Today', num: stats.today, to: '/agent/tickets' },
  ];

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>Dashboard</h1></div>
        <div className="stat-cards">
          {cards.map((c) => (
            <Link to={c.to} key={c.lbl} style={{ textDecoration: 'none' }}>
              <div className="stat-card">
                <div className="num">{c.num}</div>
                <div className="lbl">{c.lbl}</div>
              </div>
            </Link>
          ))}
        </div>
        {stats.byPriority?.length > 0 && (
          <div className="small">
            <strong>By Priority:</strong>{' '}
            {stats.byPriority.map((p) => (
              <span key={p._id} style={{ marginRight: 14 }}>
                <span className={`pill priority-${p._id.toLowerCase()}`}>{p._id}</span> {p.count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="box">
        <div className="box-header"><h1>Latest Tickets</h1></div>
        {latest.length === 0 ? (
          <p className="muted">No tickets in your scope.</p>
        ) : (
          <table className="list">
            <thead>
              <tr><th>Number</th><th>Subject</th><th>User</th><th>Status</th><th>Priority</th><th>Dept</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {latest.map((t) => (
                <tr key={t._id}>
                  <td><Link to={`/agent/tickets/${t.number}`}>#{t.number}</Link></td>
                  <td><Link to={`/agent/tickets/${t.number}`}>{t.subject}</Link></td>
                  <td>{t.user?.name}</td>
                  <td><span className="pill" style={{ background: STATUS_COLORS[t.status] || '#95a5a6' }}>{t.status}</span></td>
                  <td><span className={`pill priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td>{t.dept?.name || '—'}</td>
                  <td>{formatDateTime(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {workload.length > 0 && (
        <div className="box">
          <div className="box-header"><h1>Agent Workload</h1></div>
          <table className="list">
            <thead>
              <tr><th>Agent</th><th>Total</th><th>Open</th><th>Assigned</th><th>Overdue</th></tr>
            </thead>
            <tbody>
              {workload.map((r) => (
                <tr key={r.agent._id}>
                  <td>{r.agent.name}</td>
                  <td>{r.total}</td>
                  <td>{r.open}</td>
                  <td>{r.assigned}</td>
                  <td>{r.overdue > 0 ? <span className="pill" style={{ background: '#fde8e8', color: '#b42318' }}>{r.overdue}</span> : r.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
