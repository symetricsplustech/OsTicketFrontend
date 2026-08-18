import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function Departments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api.get('/admin/departments').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/departments/${editing._id}`, form);
      else await api.post('/admin/departments', form);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this department?')) return;
    try { await api.delete(`/admin/departments/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Departments</h1>
        <button className="btn small" onClick={() => { setForm({}); setEditing(null); setShowForm(true); }}>Add Department</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? 'Edit Department' : 'Add Department'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Parent Department</label>
                <select value={form.parent || ''} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">None</option>
                  {items.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select></div>
              <div className="field"><label>Email</label>
                <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>SLA Plan</label>
                <input type="text" value={form.sla || ''} onChange={(e) => setForm({ ...form, sla: e.target.value })} /></div>
              <div className="field"><label>Public?</label>
                <select value={form.isPublic === undefined ? true : form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.value === 'true' })}>
                  <option value="true">Yes</option><option value="false">No</option>
                </select></div>
              <div className="field"><label>Status</label>
                <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="disabled">Disabled</option>
                </select></div>
            </div>
            <div className="field"><label>Notes</label>
              <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <h3 style={{ marginTop: 14 }}>Business Hours &amp; Schedule</h3>
            <div className="form-row">
              <div className="field"><label>Timezone</label>
                <input type="text" value={form.schedule?.timezone || ''} placeholder="e.g. America/New_York"
                  onChange={(e) => setForm({ ...form, schedule: { ...(form.schedule || {}), timezone: e.target.value } })} /></div>
              <div className="field"><label>Business Hours Enabled</label>
                <select value={form.schedule?.businessHoursEnabled ? 'yes' : 'no'}
                  onChange={(e) => setForm({ ...form, schedule: { ...(form.schedule || {}), businessHoursEnabled: e.target.value === 'yes' } })}>
                  <option value="yes">Yes</option><option value="no">No</option>
                </select></div>
            </div>
            <div className="form-row">
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']).map((day) => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox"
                    checked={((form.schedule?.days || {})[day])?.enabled}
                    onChange={(e) => setForm({
                      ...form,
                      schedule: {
                        ...(form.schedule || {}),
                        days: { ...(form.schedule?.days || {}), [day]: { ...((form.schedule?.days || {})[day] || {}), enabled: e.target.checked } },
                      },
                    })} />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Parent</th><th>Email</th><th>Manager</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((d) => (
            <tr key={d._id}>
              <td><strong>{d.name}</strong></td>
              <td>{d.parent?.name || '—'}</td>
              <td>{d.email || '—'}</td>
              <td>{d.manager?.name || '—'}</td>
              <td><span className={`pill ${d.status === 'active' ? 'green' : 'gray'}`}>{d.status}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(d); setForm({ ...d, parent: d.parent?._id || '', sla: d.sla?._id || '' }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(d)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
