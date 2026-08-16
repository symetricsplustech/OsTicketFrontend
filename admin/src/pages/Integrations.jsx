import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

const EVENT_CHOICES = [
  'ticket.created', 'ticket.assigned', 'ticket.replied', 'ticket.closed', 'ticket.merged',
  'ticket.opened', 'ticket.transferred', 'ticket.priority', 'mention',
  'sla_paused', 'sla_resumed', 'sla_threshold',
];

export default function Integrations() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api.get('/admin/integrations').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    const body = {
      key: (form.key || '').trim().toLowerCase(),
      name: form.name,
      icon: form.icon || '',
      category: form.category || 'other',
      isEnabled: !!form.isEnabled,
      description: form.description || '',
      events: (form.events || []).map((s) => s.trim()).filter(Boolean),
      config: { ...(form.config || {}), webhookUrl: (form.config?.webhookUrl || '').trim() },
    };
    try {
      if (editing) await api.put(`/admin/integrations/${editing._id}`, body);
      else await api.post('/admin/integrations', body);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete integration "${item.name}"?`)) return;
    try { await api.delete(`/admin/integrations/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const openEdit = (item) => {
    setForm({
      key: item.key || '',
      name: item.name || '',
      icon: item.icon || '',
      category: item.category || 'other',
      isEnabled: !!item.isEnabled,
      description: item.description || '',
      events: item.events || [],
      config: { ...(item.config || {}) },
    });
    setEditing(item);
    setShowForm(true);
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Plugins &amp; Integrations</h1>
        <button className="btn small" onClick={() => { setForm({ key: '', name: '', icon: '', category: 'other', isEnabled: false, description: '', events: [], config: {} }); setEditing(null); setShowForm(true); }}>Add New</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <form onSubmit={save} className="admin-form" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <label>Key (unique, lowercase, e.g. slack) <input value={form.key || ''} onChange={(e) => setForm({ ...form, key: e.target.value })} required /></label>
            <label>Name <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Icon (emoji or URL) <input value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
          </div>
          <div className="form-row">
            <label>Category
              <select value={form.category || 'other'} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="chat">Chat</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="messaging">Messaging</option>
                <option value="authentication">Authentication</option>
                <option value="automation">Automation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>Enabled
              <select value={form.isEnabled ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, isEnabled: e.target.value === 'yes' })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
            <label>Webhook URL
              <input type="url" value={form.config?.webhookUrl || ''} onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), webhookUrl: e.target.value } })} placeholder="https://hooks.example.com/..." />
            </label>
          </div>
          <div className="form-row">
            <label style={{ flex: 1 }}>Events (comma-separated: {EVENT_CHOICES.join(', ')})
              <input value={(form.events || []).join(', ')} onChange={(e) => setForm({ ...form, events: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="ticket.created, ticket.assigned, mention" />
            </label>
          </div>
          <div className="form-row">
            <label style={{ flex: 1 }}>Description <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit">{editing ? 'Save Changes' : 'Create Integration'}</button>
            <button className="btn outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <table className="table">
        <thead>
          <tr><th>Integration</th><th>Category</th><th>Events</th><th>Webhook URL</th><th>Last Delivery</th><th>Last Status</th><th>Failures</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td><span style={{ fontSize: 18, verticalAlign: -3, marginRight: 6 }}>{p.icon || '🧩'}</span><strong>{p.name}</strong>{(p.description || p.key) && <div className="small muted">{p.key}{p.description ? ` — ${p.description}` : ''}</div>}</td>
              <td><span className="pill">{p.category}</span></td>
              <td>{p.events && p.events.length ? p.events.map((ev) => <span key={ev} className="pill" style={{ marginRight: 2, marginBottom: 2 }}>{ev}</span>) : '—'}</td>
              <td className="small">{p.config?.webhookUrl || '—'}</td>
              <td className="small">{p.lastDeliveryAt ? formatDateTime(p.lastDeliveryAt) : '—'}</td>
              <td className="small">{p.lastStatus || '—'}</td>
              <td>{p.failureCount > 0 ? <span className="pill pill-danger">{p.failureCount}</span> : <span className="pill green">0</span>}</td>
              <td><span className={`pill ${p.isEnabled ? 'green' : 'gray'}`}>{p.isEnabled ? 'Enabled' : 'Disabled'}</span></td>
              <td className="row-actions">
                <button className="btn small" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn small danger" onClick={() => del(p)}>Delete</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={9} className="muted center">No integrations found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}