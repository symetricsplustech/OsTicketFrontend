import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

const PAGE_STATUS = ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'];
const INC_STATUS = ['investigating', 'identified', 'monitoring', 'resolved', 'maintenance'];

export default function StatusPages() {
  const [pages, setPages] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', slug: '', description: '', isPublic: true, branding: { primaryColor: '#2563eb' } });
  const [incForm, setIncForm] = useState({ title: '', body: '', statusPage: '', severity: 'major', status: 'investigating', componentsAffected: '' });

  const load = async () => {
    try {
      const [p, i] = await Promise.all([adminEn.statusPages(), adminEn.statusIncidents()]);
      setPages(p); setIncidents(i); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const F = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

  const createPage = async () => {
    try {
      if (!form.slug.trim()) form.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await adminEn.createStatusPage(form); setForm({ name: '', slug: '', description: '', isPublic: true, branding: { primaryColor: '#2563eb' } }); await load();
    } catch (e) { setError(e.message); }
  };

  const addComponent = async (page) => {
    const name = window.prompt('Component name:', 'API');
    if (!name) return;
    await adminEn.addComponent(page._id, { name }); await load();
  };

  const setCompStatus = async (page, idx, status) => {
    const components = page.components.map((c, i) => i === idx ? { ...c, status, updatedAt: new Date().toISOString() } : c);
    await adminEn.updateStatusPage(page._id, { components }); await load();
  };

  const setPageStatus = async (page, status) => {
    await adminEn.updateStatusPage(page._id, { components: page.components.map((c) => ({ ...c, status, updatedAt: new Date().toISOString() })) });
    await load();
  };

  const togglePublic = async (page) => {
    await adminEn.updateStatusPage(page._id, { isPublic: !page.isPublic }); await load();
  };

  const createIncident = async () => {
    try {
      await adminEn.createStatusIncident({ ...incForm, componentsAffected: incForm.componentsAffected.split(',').map((s) => s.trim()).filter(Boolean) });
      setIncForm({ title: '', body: '', statusPage: '', severity: 'major', status: 'investigating', componentsAffected: '' });
      await load();
    } catch (e) { setError(e.message); }
  };

  const setIncStatus = async (inc, status) => {
    try {
      await adminEn.updateStatusIncident(inc._id, { status, ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) });
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <h1>Status Pages</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>New Status Page</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Cloud Status" /></F>
          <F label="Slug"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="acme" /></F>
          <F label="Accent Color"><input type="color" value={form.branding.primaryColor} onChange={(e) => setForm({ ...form, branding: { ...form.branding, primaryColor: e.target.value } })} /></F>
          <F label="Public"><select value={form.isPublic ? '1' : '0'} onChange={(e) => setForm({ ...form, isPublic: e.target.value === '1' })}>
            <option value="1">Yes</option><option value="0">No</option>
          </select></F>
          <div className="field"><span></span><button className="btn" onClick={createPage}>Create Page</button></div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Pages ({pages.length})</h1></div>
        {loading ? <p className="muted">Loading…</p> : pages.length === 0 ? <p className="muted">No status pages yet.</p> : pages.map((p) => (
          <div key={p._id} className="box mb-10">
            <div className="box-header">
              <h1>{p.name} <span className="muted small">/status/{p.slug}</span>
                {' '}<span className={`pill ${p.isPublic ? '' : 'muted'}`}>{p.isPublic ? 'public' : 'private'}</span></h1>
              <div className="right">
                <button className="btn secondary" onClick={() => setPageStatus(p, PAGE_STATUS.every((s) => p.components.every((c) => c.status === 'operational')) ? 'major_outage' : 'operational')}>
                  {p.components.every((c) => c.status === 'operational') ? 'Simulate Outage' : 'Restore All'}
                </button>{' '}
                <button className="btn secondary" onClick={() => addComponent(p)}>+ Component</button>{' '}
                <button className="btn secondary" onClick={() => togglePublic(p)}>{p.isPublic ? 'Make Private' : 'Publish'}</button>
              </div>
            </div>
            <table className="list">
              <thead><tr><th>Component</th><th>Group</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                {(p.components || []).map((c, idx) => (
                  <tr key={`${c.name}-${idx}`}>
                    <td>{c.name}</td>
                    <td>{c.group || '—'}</td>
                    <td>
                      {PAGE_STATUS.map((s) => (
                        <button key={s} className={`pill ${c.status === s ? '' : 'muted'}`} style={{ cursor: 'pointer', marginRight: 4 }} onClick={() => setCompStatus(p, idx, s)}>{s}</button>
                      ))}
                    </td>
                    <td>{new Date(c.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {(p.components || []).length === 0 && <tr><td colSpan={4} className="muted">No components. Add the first one.</td></tr>}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Post Incident</h1></div>
        <div className="form-row">
          <F label="Title"><input value={incForm.title} onChange={(e) => setIncForm({ ...incForm, title: e.target.value })} placeholder="Partial API degradation" /></F>
          <F label="Page"><select value={incForm.statusPage} onChange={(e) => setIncForm({ ...incForm, statusPage: e.target.value })}>
            <option value="">— none —</option>
            {pages.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select></F>
          <F label="Severity"><select value={incForm.severity} onChange={(e) => setIncForm({ ...incForm, severity: e.target.value })}>
            {['critical', 'major', 'minor', 'maintenance'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select></F>
        </div>
        <div className="form-row">
          <F label="Body"><input value={incForm.body} onChange={(e) => setIncForm({ ...incForm, body: e.target.value })} placeholder="We are seeing elevated error rates…" /></F>
          <F label="Affected Components (comma-sep)"><input value={incForm.componentsAffected} onChange={(e) => setIncForm({ ...incForm, componentsAffected: e.target.value })} /></F>
          <div className="field"><span></span><button className="btn" onClick={createIncident}>Post Incident</button></div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Incidents ({incidents.length})</h1></div>
        <table className="list">
          <thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>Started</th><th>Affects</th></tr></thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i._id}>
                <td><b>{i.title}</b><div className="muted small">{i.body}</div></td>
                <td><span className="pill">{i.severity}</span></td>
                <td>
                  {INC_STATUS.map((s) => (
                    <button key={s} className={`pill ${i.status === s ? '' : 'muted'}`} style={{ cursor: 'pointer', marginRight: 4 }} onClick={() => setIncStatus(i, s)}>{s}</button>
                  ))}
                </td>
                <td>{new Date(i.startedAt).toLocaleString()}</td>
                <td>{(i.componentsAffected || []).join(', ') || '—'}</td>
              </tr>
            ))}
            {incidents.length === 0 && <tr><td colSpan={5} className="muted">No incidents.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}