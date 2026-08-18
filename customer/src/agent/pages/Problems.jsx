import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';
import { en } from '../lib/enterprise.js';

const STATUS = ['open', 'investigation', 'known_error', 'workaround', 'root_cause', 'fix_in_progress', 'fixed', 'closed'];

export default function Problems() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'High', status: 'investigation' });

  const load = () => {
    en.problems({ limit: 100 }).then((d) => setItems(d.items)).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    setBusy(true);
    setError('');
    try { await en.createProblem(form); setCreating(false); load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const saveStatus = async (id, status) => {
    await api.put(`/enterprise/problems/${id}`, { status }).catch((e) => setError(e.message));
    load();
  };

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Problems</h1>
        <button className="btn" onClick={() => setCreating(true)}>+ New problem</button>
      </div>
      {error && <div className="alert">{error}</div>}
      {creating && (
        <div className="box et-mb">
          <div className="box-header">Create problem</div>
          <div className="form-row"><label>Title</label><input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-row"><label>Description</label><textarea className="field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <label>Priority</label>
            <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Normal</option><option>High</option><option>Emergency</option>
            </select>
          </div>
          <div className="buttons"><button className="btn" disabled={busy} onClick={submit}>Create</button><button className="btn" onClick={() => setCreating(false)}>Cancel</button></div>
        </div>
      )}
      <table className="et-table">
        <thead><tr><th>Number</th><th>Title</th><th>Priority</th><th>Status</th><th>Created</th><th>Related</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td><strong>{p.number}</strong></td>
              <td>{p.title}</td>
              <td><span className="pill">{p.priority}</span></td>
              <td>
                <select className="field et-sm" value={p.status} onChange={(e) => saveStatus(p._id, e.target.value)}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>{formatDateTime(p.createdAt)}</td>
              <td>{p.relatedTicket ? 'ticket' : ''} {p.relatedIncident ? 'incident' : ''} {p.relatedAsset ? 'asset' : ''} {!p.relatedTicket && !p.relatedIncident && !p.relatedAsset ? '—' : ''}</td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={6} className="muted">No problems yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}