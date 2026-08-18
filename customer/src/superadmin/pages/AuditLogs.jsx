import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams({ page, limit: 25 });
    if (action) params.set('action', action);
    if (search) params.set('search', search);
    api.get(`/superadmin/audit-logs?${params}`)
      .then(({ data }) => {
        setItems(data.data);
        setMeta(data.meta);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [page, action]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fmtAction = (a) => a.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <h1>Audit Logs</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header">
          <h1>Security & Activity Trail</h1>
        </div>
        <div className="member-picker-toolbar" style={{ border: 'none', padding: '0 0 12px' }}>
          <input
            type="text"
            className="member-search"
            placeholder="Search actions, entities, names…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="member-search-by" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
            <option value="">All actions</option>
            <option value="company.created">Company Created</option>
            <option value="company.updated">Company Updated</option>
            <option value="company.suspended">Company Suspended</option>
            <option value="company.plan_changed">Plan Changed</option>
            <option value="plan.created">Plan Created</option>
            <option value="plan.updated">Plan Updated</option>
            <option value="payment.verified">Payment Verified</option>
            <option value="impersonation.company_admin">Impersonation</option>
            <option value="superadmin.created">Super Admin Created</option>
            <option value="superadmin.updated">Super Admin Updated</option>
            <option value="superadmin.password_changed">Password Changed</option>
          </select>
        </div>
        <table className="list">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Entity</th>
              <th>By</th>
              <th>Company</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="6" className="muted">No audit logs found.</td></tr>}
            {items.map((log) => (
              <tr key={log._id}>
                <td>{formatDateTime(log.createdAt)}</td>
                <td><span className="plan-badge">{fmtAction(log.action)}</span></td>
                <td>{log.entityType} {log.entityId ? <span className="muted small">({String(log.entityId).slice(-6)})</span> : null}</td>
                <td>{log.superAdmin?.name || log.superAdmin?.email || '—'}</td>
                <td>{log.company?.name || '—'}</td>
                <td className="muted">{log.ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {meta.page} of {meta.totalPages || 1}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}
