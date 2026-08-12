import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organization: '', status: 'active' });

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

  return (
    <div className="box">
      <div className="box-header">
        <h1>Users</h1>
        <button className="btn small" onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', phone: '', organization: '', status: 'active' }); setShowForm(true); }}>Add User</button>
      </div>
      {error && <div className="alert error">{error}</div>}
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
