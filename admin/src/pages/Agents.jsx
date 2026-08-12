import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function Agents() {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [depts, setDepts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', isAdmin: false, isActive: true, departments: [], teams: [], permissions: [] });

  const escalationEnabled = form.permissions.includes('escalations.manage');
  const toggleEscalation = () =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes('escalations.manage')
        ? f.permissions.filter((p) => p !== 'escalations.manage')
        : [...f.permissions, 'escalations.manage'],
    }));

  const load = () => {
    api.get('/admin/agents').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
    api.get('/admin/roles').then(({ data }) => setRoles(data.items)).catch(() => {});
    api.get('/admin/teams').then(({ data }) => setTeams(data.items)).catch(() => {});
    api.get('/admin/departments').then(({ data }) => setDepts(data.items)).catch(() => {});
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (!editing && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const payload = {
        ...form,
        departments: form.departments.map((d) => ({ department: d, isPrimary: false })),
      };
      if (editing) await api.put(`/admin/agents/${editing._id}`, payload);
      else await api.post('/admin/agents', payload);
      setShowForm(false); setEditing(null);
      setForm({ name: '', email: '', password: '', role: '', isAdmin: false, isActive: true, departments: [], teams: [], permissions: [] });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this agent?')) return;
    try { await api.delete(`/admin/agents/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Agents</h1>
        <button className="btn small" onClick={() => { setEditing(null); setShowForm(true); }}>Add Agent</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? `Edit Agent: ${editing.name}` : 'Add Agent'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Full Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email <span className="req">*</span></label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>{editing ? 'New Password (leave blank to keep)' : 'Password'} {!editing && <span className="req">*</span>}</label>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="">No Role</option>
                  {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select></div>
              <div className="field"><label>Status</label>
                <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option><option value="false">Disabled</option>
                </select></div>
              <div className="field"><label><input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} /> System Administrator</label></div>
              <div className="field"><label><input type="checkbox" checked={escalationEnabled} onChange={toggleEscalation} /> Escalation Rules <span className="small muted">(manage escalation rules)</span></label></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Department Access</label>
                <select multiple size="5" value={form.departments} onChange={(e) => setForm({ ...form, departments: Array.from(e.target.selectedOptions, (o) => o.value) })}>
                  {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <span className="small muted">Ctrl+click to select multiple</span></div>
              <div className="field"><label>Teams</label>
                <select multiple size="5" value={form.teams} onChange={(e) => setForm({ ...form, teams: Array.from(e.target.selectedOptions, (o) => o.value) })}>
                  {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <span className="small muted">Ctrl+click to select multiple</span></div>
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save Changes' : 'Create Agent'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Admin</th><th>Escalation</th><th>Departments</th><th>Teams</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a._id}>
              <td><strong>{a.name}</strong></td>
              <td>{a.email}</td>
              <td>{a.role?.name || '—'}</td>
              <td>{a.isAdmin ? <span className="pill green">Yes</span> : <span className="pill gray">No</span>}</td>
              <td>{(a.permissions || []).includes('escalations.manage') || a.isAdmin ? <span className="pill green">Yes</span> : <span className="pill gray">No</span>}</td>
              <td className="small">{a.departments?.map((d) => d.department?.name).join(', ') || '—'}</td>
              <td className="small">{a.teams?.map((t) => t.name).join(', ') || '—'}</td>
              <td><span className={`pill ${a.isActive ? 'green' : 'gray'}`}>{a.isActive ? 'active' : 'disabled'}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(a); setForm({ name: a.name, email: a.email, password: '', role: a.role?._id || '', isAdmin: a.isAdmin, isActive: a.isActive, departments: a.departments?.map((d) => String(d.department?._id)) || [], teams: a.teams?.map((t) => t._id) || [], permissions: a.permissions || [] }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(a)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
