import React, { useEffect, useState } from 'react';
import { api, ROLE_PERMISSIONS } from '../lib/index.js';

export default function Roles() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', permissions: [], isAdmin: false });

  const load = () => {
    api.get('/admin/roles').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const togglePerm = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm],
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/roles/${editing._id}`, form);
      else await api.post('/admin/roles', form);
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this role?')) return;
    try { await api.delete(`/admin/roles/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Roles &amp; Permissions</h1>
        <button className="btn small" onClick={() => { setForm({ name: '', permissions: [], isAdmin: false }); setEditing(null); setShowForm(true); }}>Add Role</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? 'Edit Role' : 'Add Role'}</h2>
          <form onSubmit={save}>
            <div className="field"><label>Role Name <span className="req">*</span></label>
              <input type="text" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field">
              <label><input type="checkbox" checked={!!form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} /> Full Admin Access (all permissions)</label>
            </div>
            {!form.isAdmin && (
              <div className="field">
                <label>Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {ROLE_PERMISSIONS.map((p) => (
                    <label key={p.value} style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="checkbox" checked={form.permissions.includes(p.value)} onChange={() => togglePerm(p.value)} /> {p.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Admin</th><th>Permissions</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((r) => (
            <tr key={r._id}>
              <td><strong>{r.name}</strong></td>
              <td>{r.isAdmin ? <span className="pill green">Admin</span> : <span className="pill gray">No</span>}</td>
              <td className="small">{r.permissions?.length ? r.permissions.join(', ') : '—'}</td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(r); setForm({ name: r.name, permissions: r.permissions || [], isAdmin: r.isAdmin }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(r)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
