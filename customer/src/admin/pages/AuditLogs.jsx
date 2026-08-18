import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

export default function AuditLogs() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', agent: '', user: '' });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminEn.audit({ ...filters, page });
      setEvents(res.events || res.items || []); setTotal(res.total || 0); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const apply = () => load(1);

  const TYPE_COLORS = {
    create: '', update: '', delete: ' pill-danger', assign: '', transfer: '', status: '',
    close: '', reopen: '', priority: '', note: '', incident: '', problem: '', change: '', tenant: '',
  };

  const renderValue = (v) => {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'object') return <span style={{ fontFamily: 'monospace' }} className="small">{JSON.stringify(v)}</span>;
    return String(v);
  };

  const renderChanges = (e) => {
    const list = Array.isArray(e.changes) ? e.changes : (Array.isArray(e.details?.changes) ? e.details?.changes : []);
    if (!list.length) return '—';
    return list.map((c, i) => {
      const before = 'before' in c ? c.before : c.from;
      const after = 'after' in c ? c.after : c.to;
      return (
        <div key={i} className="small">
          <strong>{c.field}</strong>: {renderValue(before)} <span className="muted">&rarr;</span> {renderValue(after)}
        </div>
      );
    });
  };

  return (
    <div>
      <h1>Audit Log</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="form-row">
          <label className="field"><span>Entity Type</span>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">all</option>
              {['ticket', 'user', 'organization', 'agent', 'incident', 'problem', 'change', 'asset', 'contract', 'workflow', 'approval', 'survey', 'webhook', 'apikey', 'statuspage', 'conversation'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="field"><span>Agent</span><input value={filters.agent} onChange={(e) => setFilters({ ...filters, agent: e.target.value })} placeholder="agent id or name" /></label>
          <div className="field"><span></span><button className="btn" onClick={apply}>Apply Filters</button></div>
          <div className="field"><span></span><strong>{total} events</strong></div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Audit Trail</h1></div>
        <table className="list">
          <thead><tr><th>At</th><th>Entity</th><th>Action</th><th>Message</th><th>Changes</th><th>By</th><th>IP / User-Agent</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="muted">Loading…</td></tr> : events.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.at || e.createdAt).toLocaleString()}</td>
                <td><span className="pill">{e.entityType}</span></td>
                <td><span className={`pill${TYPE_COLORS[e.action] || ''}`}>{e.action}</span></td>
                <td>{e.message || e.details || '—'}</td>
                <td>{renderChanges(e)}</td>
                <td>{e.agent?.name || e.actor?.name || (e.actorEmail || '—')}</td>
                <td className="small">{e.ip || '—'}{e.userAgent ? <div style={{ fontFamily: 'monospace' }}>{e.userAgent}</div> : ''}</td>
              </tr>
            ))}
            {!loading && events.length === 0 && <tr><td colSpan={7} className="muted">No audit events match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}