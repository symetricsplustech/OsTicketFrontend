import React, { useEffect, useState } from 'react';
import { en } from '../lib/enterprise.js';
import { formatDateTime } from '../lib/index.js';

const STATUS = ['investigating', 'identified', 'monitoring', 'resolved', 'closed'];

export default function Incidents() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'P2', status: 'investigating', affectedServices: '', affectedTickets: '', startedAt: '' });

  const load = (p = page) => {
    en.incidents({ page: p, limit: 20, status: '' }).then((d) => { setItems(d.items); setTotal(d.total); setPage(d.page); }).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const open = (id) => {
    en.incidents({ id }).then(() => {
      const it = items.find((x) => x._id === id);
      setDetail(it);
    });
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const body = {
        ...form,
        affectedTickets: form.affectedTickets ? form.affectedTickets.split(',').map((s) => s.trim()).filter(Boolean) : [],
        affectedServices: form.affectedServices ? form.affectedServices.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await en.createIncident(body);
      setCreating(false);
      load(1);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const setStatus = async (id, status) => {
    await en.updateIncident(id, { status }).catch((e) => setError(e.message));
    load(page);
  };

  const addLog = async (id) => {
    const text = prompt('What happened?');
    if (!text) return;
    await en.addIncidentTimeline(id, { body: text }).catch((e) => setError(e.message));
    load(page);
  };

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Incidents</h1>
        <button className="btn" onClick={() => setCreating(true)}>+ New incident</button>
      </div>
      {error && <div className="alert">{error}</div>}
      {creating && (
        <div className="box et-mb">
          <div className="box-header">Create incident</div>
          <div className="form-row"><label>Title</label><input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-row"><label>Description</label><textarea className="field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <label>Priority</label>
            <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>P1</option><option>P2</option><option>P3</option><option>P4</option>
            </select>
          </div>
          <div className="form-row"><label>Affected ticket numbers (comma separated)</label><input className="field" value={form.affectedTickets} onChange={(e) => setForm({ ...form, affectedTickets: e.target.value })} /></div>
          <div className="form-row"><label>Affected services (comma separated)</label><input className="field" value={form.affectedServices} onChange={(e) => setForm({ ...form, affectedServices: e.target.value })} /></div>
          <div className="buttons"><button className="btn" disabled={busy} onClick={submit}>Create</button><button className="btn" onClick={() => setCreating(false)}>Cancel</button></div>
        </div>
      )}
      <table className="et-table">
        <thead><tr><th>Number</th><th>Title</th><th>Priority</th><th>Status</th><th>Started</th><th># Tickets</th><th></th></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              <td><strong>{it.number}</strong></td>
              <td>{it.title}</td>
              <td><span className="pill">{it.priority}</span></td>
              <td>
                <select className="field et-sm" value={it.status} onChange={(e) => setStatus(it._id, e.target.value)}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>{formatDateTime(it.startedAt)}</td>
              <td>{(it.affectedTickets || []).length}</td>
              <td><button className="btn btn-small" onClick={() => { setDetail(it); }}>Log</button></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={7} className="muted">No incidents yet.</td></tr>}
        </tbody>
      </table>
      <div className="pagination">
        <button className="btn btn-small" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button className="btn btn-small" disabled={page * 20 >= total} onClick={() => load(page + 1)}>Next</button>
      </div>
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{detail.number} — {detail.title}<a onClick={() => setDetail(null)}>×</a></div>
            <div className="modal-body">
              <p>{detail.description}</p>
              <div className="et-flex et-wrap et-tags">
                {(detail.affectedServices || []).map((s, i) => <span key={i} className="pill">{s}</span>)}
              </div>
              <h4>Timeline</h4>
              {(detail.timeline || []).map((t, i) => (
                <div key={i} className="et-row">{formatDateTime(t.at)} — <strong>{t.status}</strong>: {t.body || t.note}</div>
              ))}
              <div className="buttons et-mt">
                <button className="btn" onClick={() => addLog(detail._id)}>Add timeline entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}