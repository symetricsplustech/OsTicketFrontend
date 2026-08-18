import React, { useEffect, useState } from 'react';
import { api, formatDate } from '../lib/index.js';
import { en } from '../lib/enterprise.js';

const TYPES = ['server', 'desktop', 'laptop', 'network', 'software', 'database', 'virtual', 'cloud', 'other'];

export default function Assets() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [impact, setImpact] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'server', serial: '', ip: '', hostname: '', environment: 'production', criticality: 'medium', location: '' });

  const load = () => {
    en.assets({ limit: 100 }).then((d) => setItems(d.items)).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    setBusy(true);
    setError('');
    try { await en.createAsset(form); setCreating(false); load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const showImpact = async (id) => {
    try { setImpact(await en.assetImpact(id)); } catch (e) { setError(e.message); }
  };

  const criticality = (c) => ({ low: 'et-l', medium: 'et-m', high: 'et-h', critical: 'et-c' }[c] || '');

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Assets / CMDB</h1>
        <button className="btn" onClick={() => setCreating(true)}>+ Add asset</button>
      </div>
      {error && <div className="alert">{error}</div>}
      {creating && (
        <div className="box et-mb">
          <div className="box-header">Add asset</div>
          <div className="form-row"><label>Name</label><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row">
            <label>Type</label>
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row"><label>Serial</label><input className="field" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} /></div>
          <div className="form-row"><label>IP</label><input className="field" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} /></div>
          <div className="form-row"><label>Hostname</label><input className="field" value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} /></div>
          <div className="form-row">
            <label>Criticality</label>
            <select className="field" value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
          </div>
          <div className="buttons"><button className="btn" disabled={busy} onClick={submit}>Add</button><button className="btn" onClick={() => setCreating(false)}>Cancel</button></div>
        </div>
      )}
      <table className="et-table">
        <thead><tr><th>Name</th><th>Type</th><th>Host/IP</th><th>Environment</th><th>Criticality</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a._id}>
              <td><strong>{a.name}</strong> {a.serial && <span className="muted small">({a.serial})</span>}</td>
              <td><span className="pill">{a.type}</span></td>
              <td>{a.hostname || a.ip || '—'}</td>
              <td>{a.environment}</td>
              <td><span className={`pill ${criticality(a.criticality)}`}>{a.criticality}</span></td>
              <td>{a.status}</td>
              <td><button className="btn btn-small" onClick={() => showImpact(a._id)}>Impact</button></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={7} className="muted">No assets yet.</td></tr>}
        </tbody>
      </table>
      {impact && (
        <div className="modal-overlay" onClick={() => setImpact(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Impact analysis — {impact.asset?.name}<a onClick={() => setImpact(null)}>×</a></div>
            <div className="modal-body">
              <h4>Dependencies ({impact.dependencies?.length || 0})</h4>
              {(impact.dependencies || []).map((d, i) => <div key={i} className="et-row">→ {d.name} <span className="muted">({d.relationshipType})</span></div>)}
              <h4>Impacted tickets ({impact.impactedTickets?.length || 0})</h4>
              {(impact.impactedTickets || []).map((t, i) => <div key={i} className="et-row">#{t.number} — {t.subject}</div>)}
              <h4>Incidents ({impact.incidents?.length || 0})</h4>
              {(impact.incidents || []).map((t, i) => <div key={i} className="et-row">{t.number || t.title}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}