import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

const TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

const OPERATORS = [
  { value: 'equals', label: 'is' },
  { value: 'not_equals', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'in', label: 'is one of (comma separated)' },
];

export default function CustomFields() {
  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api.get('/admin/custom-fields').then(({ data }) => setItems(data.items || [])).catch((err) => setError(err.message));
  };
  useEffect(() => {
    load();
    api.get('/admin/help-topics').then(({ data }) => setTopics(data.items || [])).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, options: typeof form.options === 'string' ? form.options.split(',').map((s) => s.trim()).filter(Boolean) : form.options };
      if (editing) await api.put(`/admin/custom-fields/${editing._id}`, body);
      else await api.post('/admin/custom-fields', body);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete field "${item.label}"?`)) return;
    try { await api.delete(`/admin/custom-fields/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const openEdit = (item) => {
    setForm({
      ...item,
      helpTopic: item.helpTopic?._id || '',
      options: (item.options || []).join(', '),
      conditions: (item.conditions || []).map((c) => ({ ...c })),
    });
    setEditing(item);
    setShowForm(true);
  };

  const newForm = () => {
    setForm({ label: '', name: '', type: 'text', required: false, options: '', placeholder: '', helpTopic: '', isActive: true, sortOrder: 0, conditions: [] });
    setEditing(null);
    setShowForm(true);
  };

  const setCond = (i, patch) => {
    const conditions = (form.conditions || []).map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    setForm({ ...form, conditions });
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Custom Fields</h1>
        <button className="btn small" onClick={newForm}>Add Custom Field</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <form onSubmit={save} className="admin-form" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="field"><label>Label (shown to users) *</label>
              <input value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} required /></div>
            <div className="field"><label>Field Name *</label>
              <input placeholder="e.g. order_number" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="field"><label>Field Type</label>
              <select value={form.type || 'text'} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Options (comma separated, for dropdown)</label>
              <input value={form.options || ''} onChange={(e) => setForm({ ...form, options: e.target.value })} /></div>
            <div className="field"><label>Restrict to Help Topic</label>
              <select value={form.helpTopic || ''} onChange={(e) => setForm({ ...form, helpTopic: e.target.value || null })}>
                <option value="">— All Topics —</option>
                {topics.map((t) => <option key={t._id} value={t._id}>{t.topic}</option>)}
              </select></div>
            <div className="field"><label>Placeholder</label>
              <input value={form.placeholder || ''} onChange={(e) => setForm({ ...form, placeholder: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={!!form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} /> Required</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="field"><label>Sort Order</label>
              <input type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
          </div>
          <h4 style={{ marginTop: 12 }}>Conditional Visibility (show only when)</h4>
          {(form.conditions || []).map((c, i) => (
            <div key={i} className="form-row" style={{ alignItems: 'center' }}>
              <div className="field"><label>Field</label>
                <select value={c.field || ''} onChange={(e) => setCond(i, { field: e.target.value })}>
                  <option value="">— select field —</option>
                  {items.filter((f) => !editing || f._id !== editing._id).map((f) => <option key={f._id} value={f.name}>{f.label}</option>)}
                </select></div>
              <div className="field"><label>Operator</label>
                <select value={c.operator || 'equals'} onChange={(e) => setCond(i, { operator: e.target.value })}>
                  {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></div>
              <div className="field"><label>Value</label>
                <input value={c.value || ''} onChange={(e) => setCond(i, { value: e.target.value })} /></div>
              <button type="button" className="btn small danger" onClick={() => setForm({ ...form, conditions: (form.conditions || []).filter((_, idx) => idx !== i) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn small secondary" onClick={() => setForm({ ...form, conditions: [...(form.conditions || []), { field: '', operator: 'equals', value: '' }] })}>+ Add Condition</button>
          <div>
            <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
            <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
          </div>
        </form>
      )}
      <table className="table">
        <thead><tr><th>Label</th><th>Field Name</th><th>Type</th><th>Required</th><th>Help Topic</th><th>Conditions</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {items.map((f) => (
            <tr key={f._id}>
              <td><strong>{f.label}</strong></td>
              <td><code>{f.name}</code></td>
              <td><span className="pill">{f.type}</span></td>
              <td>{f.required ? 'Yes' : '—'}</td>
              <td>{f.helpTopic?.topic || 'All Topics'}</td>
              <td>{(f.conditions || []).length ? `${f.conditions.length} condition(s)` : '—'}</td>
              <td><span className={`pill ${f.isActive ? 'green' : 'gray'}`}>{f.isActive ? 'Active' : 'Disabled'}</span></td>
              <td className="row-actions">
                <button className="btn small" onClick={() => openEdit(f)}>Edit</button>
                <button className="btn small danger" onClick={() => del(f)}>Delete</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={8} className="muted center">No custom fields found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}