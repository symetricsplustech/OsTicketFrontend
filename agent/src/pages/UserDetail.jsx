import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/agent/users/${id}`).then(({ data }) => setData(data)).catch((err) => setError(err.message));
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
    </>
  );
}
