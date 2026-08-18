import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';
import { en } from '../lib/enterprise.js';

const TYPES = ['standard', 'normal', 'emergency'];
const STATUSES = ['draft', 'requested', 'for_approval', 'approved', 'scheduled', 'implementing', 'implemented', 'review', 'closed', 'aborted', 'cancelled', 'rolled_back'];

export default function Changes() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'standard', priority: 'Medium', risk: 'medium', windowStart: '', windowEnd: '', implementationPlan: '', rollbackPlan: '' });

  const load = () => {
    en.changes({ limit: 100 }).then((d) => setItems(d.items)).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await en.createChange({ ...form, windowStart: form.windowStart ? new Date(form.windowStart).toISOString() : null, windowEnd: form.windowEnd ? new Date(form.windowEnd).toISOString() : null });
      setCreating(false);
      load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const setStatus = async (id, status) => {
    await api.put(`/enterprise/changes/${id}`, { status }).catch((e) => setError(e.message));
    load();
  };

  const requestApproval = async (id) => {
    try { await en.requestChangeApproval(id); setError('Approval requested.'); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Changes</h1>
        <button className="btn" onClick={() => setCreating(true)}>+ New change</button>
      </div>
      {error && <div className="alert">{error}</div>}
      {creating && (
        <div className="box et-mb">
          <div className="box-header">Create change</div>
          <div className="form-row"><label>Title</label><input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-row"><label>Description</label><textarea className="field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <label>Type</label>
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Risk</label>
            <select className="field" value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
          </div>
          <div className="form-row"><label>Window start</label><input type="datetime-local" className="field" value={form.windowStart} onChange={(e) => setForm({ ...form, windowStart: e.target.value })} /></div>
          <div className="form-row"><label>Window end</label><input type="datetime-local" className="field" value={form.windowEnd} onChange={(e) => setForm({ ...form, windowEnd: e.target.value })} /></div>
          <div className="form-row"><label>Implementation plan</label><textarea className="field" rows={2} value={form.implementationPlan} onChange={(e) => setForm({ ...form, implementationPlan: e.target.value })} /></div>
          <div className="form-row"><label>Rollback plan</label><textarea className="field" rows={2} value={form.rollbackPlan} onChange={(e) => setForm({ ...form, rollbackPlan: e.target.value })} /></div>
          <div className="buttons"><button className="btn" disabled={busy} onClick={submit}>Create</button><button className="btn" onClick={() => setCreating(false)}>Cancel</button></div>
        </div>
      )}
      <table className="et-table">
        <thead><tr><th>Number</th><th>Title</th><th>Type</th><th>Status</th><th>Window</th><th></th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c._id}>
              <td><strong>{c.number}</strong></td>
              <td><button className="et-link" onClick={() => setDetail(c)}>{c.title}</button></td>
              <td><span className="pill">{c.type}</span></td>
              <td>
                <select className="field et-sm" value={c.status} onChange={(e) => setStatus(c._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>{formatDateTime(c.windowStart)}</td>
              <td><button className="btn btn-small" onClick={() => requestApproval(c._id)}>Request approval</button></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={6} className="muted">No changes yet.</td></tr>}
        </tbody>
      </table>
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{detail.number} — {detail.title}<a onClick={() => setDetail(null)}>×</a></div>
            <div className="modal-body">
              <p>{detail.description}</p>
              <p><strong>Risk:</strong> {detail.risk} · <strong>Status:</strong> {detail.status}</p>
              <h4>Implementation plan</h4><p>{detail.implementationPlan || '—'}</p>
              <h4>Rollback plan</h4><p>{detail.rollbackPlan || '—'}</p>
              {(detail.approvals || []).length > 0 && (
                <>
                  <h4>Approvals</h4>
                  {(detail.approvals || []).map((a, i) => <div key={i} className="et-row">{a.name} — {a.status}</div>)}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}