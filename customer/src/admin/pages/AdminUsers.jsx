import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organization: '', status: 'active' });
  const [showImport, setShowImport] = useState(false);
  const [importCsv, setImportCsv] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const load = () => {
    api.get('/admin/users').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (!editing && form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${editing._id}`, payload);
      } else {
        await api.post('/admin/users', form);
      }
      setShowForm(false); setEditing(null); load();
    } catch (err) { setError(err.message); }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const download = async () => {
    try {
      const res = await api.get('/admin/export/users', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
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
      const { data } = await api.post('/admin/import/users', { csv: importCsv });
      setImportMsg(`created ${data.created}, skipped ${data.skipped}`);
      setShowImport(false);
      setImportCsv('');
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Users</h1>
        <button className="btn small secondary" onClick={download}>Export CSV</button>{' '}
        <button className="btn small secondary" onClick={() => { setImportMsg(''); setShowImport(true); }}>Import CSV</button>{' '}
        <button className="btn small" onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', phone: '', organization: '', status: 'active' }); setShowForm(true); }}>Add User</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {importMsg && <div className="alert success">{importMsg}</div>}
      {showImport && (
        <div className="form-panel">
          <h2>Import Users (CSV)</h2>
          <form onSubmit={doImport}>
            <div className="form-row">
              <div className="field"><label>CSV content <span className="req">*</span></label>
                <textarea rows={8} required value={importCsv} onChange={(e) => setImportCsv(e.target.value)} placeholder={'name,email,phone,organization\nJohn Doe,john@example.com,+1 555 0100,Acme Inc'} /></div>
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
          <h2>{editing ? `Edit User: ${editing.name}` : 'Add User'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email <span className="req">*</span></label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>{editing ? 'New Password (blank to keep)' : 'Password'} {!editing && <span className="req">*</span>}</label>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Organization</label>
                <input type="text" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="disabled">Disabled</option>
                </select></div>
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save Changes' : 'Create User'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Organization</th><th>Registered</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((u) => (
            <tr key={u._id}>
              <td><strong>{u.name}</strong></td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td>{u.organization?.name || '—'}</td>
              <td className="small">{formatDateTime(u.createdAt)}</td>
              <td><span className={`pill ${u.status === 'active' ? 'green' : 'gray'}`}>{u.status === 'active' ? 'active' : 'disabled'}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', organization: u.organization?._id || '', status: u.status }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}