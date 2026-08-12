import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';

export default function MyTickets() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/tickets', { params: { page, limit: 10, status, q: search || undefined } })
      .then(({ data }) => {
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);

  return (
    <div className="box">
      <div className="box-header"><h1>My Tickets <span className="muted" style={{ fontSize: 12 }}>({total})</span></h1></div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ width: 'auto' }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="overdue">Overdue</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
        <input type="text" placeholder="Search subject…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
          style={{ width: '220px' }} />
        <button className="btn small secondary" onClick={() => { setPage(1); load(); }}>Search</button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="muted">No tickets found. <Link to="/open">Open a new ticket</Link>.</p>
      ) : (
        <table className="list">
          <thead>
            <tr>
              <th>Number</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Created By</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td><Link to={`/ticket/${t.number}`}>#{t.number}</Link></td>
                <td><Link to={`/ticket/${t.number}`}>{t.subject}</Link></td>
                <td><span className="pill" style={{ background: STATUS_COLORS[t.status] || '#95a5a6' }}>{t.status}</span></td>
                <td><span className={`pill priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                <td>{t.dept?.name || '—'}</td>
                <td>{t.createdBy?.name || 'You'}</td>
                <td>{formatDateTime(t.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
