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
  const [savedQueues, setSavedQueues] = useState([]);
  const [queueName, setQueueName] = useState('');
  const [savedSel, setSavedSel] = useState('');

  const status = params.get('status') || 'all';
  const priority = params.get('priority') || 'all';
  const dept = params.get('dept') || 'all';

  const load = (opts = {}) => {
    setLoading(true);
    api.get('/agent/tickets', {
      params: {
        status: opts.status ?? status, priority: opts.priority ?? priority, dept: opts.dept ?? dept,
        q: (opts.search ?? search) || undefined, page: opts.page ?? page, limit: 20,
      },
    })
      .then(({ data }) => { setItems(data.items); setTotal(data.total); setPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/agent/queues').then(({ data }) => setQueues(data.queues)).catch(() => {});
    api.get('/agent/queues/saved').then(({ data }) => setSavedQueues(data.items || [])).catch(() => {});
  }, []);

  useEffect(load, [status, priority, dept, page]);

  const setStatus = (s) => { setParams({ status: s }); setPage(1); };

  const saveQueue = async () => {
    if (!queueName.trim()) return;
    try {
      await api.post('/agent/queues/saved', { name: queueName.trim(), filters: { status, priority, dept, search } });
      setQueueName('');
      api.get('/agent/queues/saved').then(({ data }) => setSavedQueues(data.items || [])).catch(() => {});
    } catch (err) {
      window.alert(err.message);
    }
  };

  const applyFilters = (f) => {
    setParams({ status: f.status || 'all', priority: f.priority || 'all', dept: f.dept || 'all' });
    setSearch(f.search || '');
    setPage(1);
    load({ status: f.status || 'all', priority: f.priority || 'all', dept: f.dept || 'all', search: f.search || '', page: 1 });
  };

  const removeQueue = async (id) => {
    if (!window.confirm('Delete this saved queue?')) return;
    try {
      await api.delete(`/agent/queues/saved/${id}`);
      setSavedQueues((qs) => qs.filter((q) => q._id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  };

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
          <select
            value={savedSel}
            onChange={(e) => {
              const q = savedQueues.find((x) => x._id === e.target.value);
              setSavedSel('');
              if (q) applyFilters(q.filters || {});
            }}
            style={{ width: 170 }}>
            <option value="">Saved Queues…</option>
            {savedQueues.map((q) => <option key={q._id} value={q._id}>{q.name}</option>)}
          </select>
          {savedQueues.map((q) => (
            <button key={q._id} className="btn small danger" title={`Delete ${q.name}`} onClick={() => removeQueue(q._id)}>✕ {q.name}</button>
          ))}
          <input type="text" placeholder="Queue name…" value={queueName}
            onChange={(e) => setQueueName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveQueue(); }}
            style={{ width: 150 }} />
          <button className="btn secondary small" onClick={saveQueue}>Save Current Filter as Queue</button>
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
