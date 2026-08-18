import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function AdminOrgs() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', website: '', status: 'active' });
  const [showImport, setShowImport] = useState(false);
  const [importCsv, setImportCsv] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const load = () => {
    api.get('/admin/orgs').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/organizations/${editing._id}`, form);
      else await api.post('/admin/orgs', form);
      setShowForm(false); setEditing(null); load();
    } catch (err) { setError(err.message); }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this organization?')) return;
    try { await api.delete(`/admin/organizations/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const download = async () => {
    try {
      const res = await api.get('/admin/export/orgs', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'organizations.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportCsv(reader.result);
    reader.readAsText(file);
  };

  const doImport = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/import/orgs', { csv: importCsv });
      setImportMsg(`created ${data.created}, skipped ${data.skipped}`);
      setShowImport(false);
      setImportCsv('');
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Organizations</h1>
        <button className="btn small secondary" onClick={download}>Export CSV</button>{' '}
        <button className="btn small secondary" onClick={() => { setImportMsg(''); setShowImport(true); }}>Import CSV</button>{' '}
        <button className="btn small" onClick={() => { setEditing(null); setForm({ name: '', phone: '', website: '', status: 'active' }); setShowForm(true); }}>Add Organization</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {importMsg && <div className="alert success">{importMsg}</div>}
      {showImport && (
        <div className="form-panel">
          <h2>Import Organizations (CSV)</h2>
          <form onSubmit={doImport}>
            <div className="form-row">
              <div className="field"><label>CSV content <span className="req">*</span></label>
                <textarea rows={8} required value={importCsv} onChange={(e) => setImportCsv(e.target.value)} placeholder={'name,address,phone,website,domain\nAcme Inc,1 Main St,+1 555 0100,https://acme.com,acme.com'} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Or choose a file</label>
                <input type="file" accept=".csv,text/csv" onChange={handleFile} /></div>
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">Import</button>
              <button className="btn small secondary" type="button" onClick={() => { setShowImport(false); setImportCsv(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? `Edit Organization: ${editing.name}` : 'Add Organization'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Website</label>
                <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="disabled">Disabled</option>
                </select></div>
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save Changes' : 'Create Organization'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Phone</th><th>Website</th><th>Created</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((o) => (
            <tr key={o._id}>
              <td><strong>{o.name}</strong></td>
              <td>{o.phone || '—'}</td>
              <td className="small">{o.website || '—'}</td>
              <td className="small">{formatDateTime(o.createdAt)}</td>
              <td><span className={`pill ${o.status === 'active' ? 'green' : 'gray'}`}>{o.status === 'active' ? 'active' : 'disabled'}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(o); setForm({ name: o.name, phone: o.phone || '', website: o.website || '', isActive: o.isActive }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(o)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}