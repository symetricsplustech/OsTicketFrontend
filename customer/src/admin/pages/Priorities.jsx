import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function Priorities() {
  const [items, setItems] = useState([]);
  const [slaPlans, setSlaPlans] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api.get('/admin/priorities').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  const loadSla = () => {
    api.get('/admin/sla-plans').then(({ data }) => setSlaPlans(data.items || data.slaPlans || [])).catch(() => {});
  };
  useEffect(() => {
    load();
    loadSla();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, level: Number(form.level) || 0 };
      if (editing) await api.put(`/admin/priorities/${editing._id}`, body);
      else await api.post('/admin/priorities', body);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete priority "${item.name}"?`)) return;
    try { await api.delete(`/admin/priorities/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      level: item.level,
      color: item.color,
      isDefault: item.isDefault,
      sla: item.sla || '',
      notes: item.notes || '',
      isActive: item.isActive !== false,
    });
    setEditing(item);
    setShowForm(true);
  };

  const sorted = [...items].sort((a, b) => (a.level || 0) - (b.level || 0));

  return (
    <div className="box">
      <div className="box-header">
        <h1>Ticket Priorities</h1>
        <button className="btn small" onClick={() => { setForm({ name: '', level: 1, color: '#64748b', isDefault: false, sla: '', notes: '' }); setEditing(null); setShowForm(true); }}>Add Priority</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <form onSubmit={save} className="admin-form" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <label>Name <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Level (1 = lowest) <input type="number" value={form.level || 0} onChange={(e) => setForm({ ...form, level: e.target.value })} required /></label>
            <label>Color <input type="color" value={form.color || '#64748b'} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
          </div>
          <div className="form-row">
            <label>Default Priority
              <select value={form.isDefault ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, isDefault: e.target.value === 'yes' })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
            <label>SLA Plan
              <select value={form.sla || ''} onChange={(e) => setForm({ ...form, sla: e.target.value || null })}>
                <option value="">&ndash; None &ndash;</option>
                {slaPlans.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <label>Status
              <select value={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label style={{ flex: 1 }}>Notes <input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit">{editing ? 'Save Changes' : 'Create Priority'}</button>
            <button className="btn outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <table className="table">
        <thead>
          <tr><th>Priority</th><th>Level</th><th>Color</th><th>Default</th><th>SLA Plan</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p._id}>
              <td><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: p.color, marginRight: 8 }} />{p.name}</td>
              <td>{p.level}</td>
              <td>{p.color}</td>
              <td>{p.isDefault ? 'Yes' : ''}</td>
              <td>{p.slaName || (p.sla ? String(p.sla) : '')}</td>
              <td>{p.isActive === false ? 'Disabled' : 'Active'}</td>
              <td className="row-actions">
                <button className="btn small" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn small danger" onClick={() => del(p)}>Delete</button>
              </td>
            </tr>
          ))}
          {!sorted.length && <tr><td colSpan={7} className="muted center">No priorities found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}