import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatDateTime, STATUS_COLORS } from '../lib/index.js';

export default function TicketList() {
  const [params, setParams] = useSearchParams();
  const [queues, setQueues] = useState({});
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const status = params.get('status') || 'all';
  const priority = params.get('priority') || 'all';
  const dept = params.get('dept') || 'all';

  const load = () => {
    setLoading(true);
    api.get('/agent/tickets', {
      params: { status, priority, dept, q: search || undefined, page, limit: 20 },
    })
      .then(({ data }) => { setItems(data.items); setTotal(data.total); setPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/agent/queues').then(({ data }) => setQueues(data.queues)).catch(() => {});
  }, []);

  useEffect(load, [status, priority, dept, page]);

  const setStatus = (s) => { setParams({ status: s }); setPage(1); };

  const queueItems = [
    { key: 'all', lbl: 'All Tickets', count: queues.all },
    { key: 'open', lbl: 'Open', count: queues.open },
    { key: 'assigned', lbl: 'Assigned', count: queues.assigned },
    { key: 'overdue', lbl: 'Overdue', count: queues.overdue },
    { key: 'mine', lbl: 'My Tickets', count: queues.mine },
    { key: 'closed', lbl: 'Closed', count: queues.closed },
    { key: 'archived', lbl: 'Archived', count: queues.archived },
  ];

  return (
    <>
      <div className="queues">
        {queueItems.map((q) => (
          <a key={q.key} className={status === q.key ? 'active' : ''} onClick={(e) => { e.preventDefault(); setStatus(q.key); }} href="#">
            {q.lbl} <b>({q.count ?? 0})</b>
          </a>
        ))}
      </div>

      <div className="box">
        <div className="box-header">
          <h1>{status === 'mine' ? 'My Tickets' : status === 'all' ? 'All Tickets' : `${status.charAt(0).toUpperCase() + status.slice(1)} Tickets`} <span className="muted">({total})</span></h1>
          <Link to="/agent/tickets/new" className="btn small">+ New Ticket</Link>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: 12, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search number or subject…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            style={{ width: 260 }} />
          <button className="btn secondary small" onClick={() => { setPage(1); load(); }}>Search</button>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No tickets found.</p>
        ) : (
          <table className="list">
            <thead>
              <tr><th>Number</th><th>Subject</th><th>User</th><th>Status</th><th>Priority</th><th>Dept</th><th>Assigned To</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td><Link to={`/agent/tickets/${t.number}`}>#{t.number}</Link></td>
                  <td><Link to={`/agent/tickets/${t.number}`}>{t.subject}</Link></td>
                  <td>{t.user?.name}</td>
                  <td><span className="pill" style={{ background: STATUS_COLORS[t.status] || '#95a5a6' }}>{t.status}</span></td>
                  <td><span className={`pill priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td>{t.dept?.name || '—'}</td>
                  <td>{t.agent?.name || t.team?.name || <em className="muted">Unassigned</em>}</td>
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
    </>
  );
}
