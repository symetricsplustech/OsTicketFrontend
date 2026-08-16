import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function HelpTopics() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [slaPlans, setSlaPlans] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api.get('/admin/help-topics').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  const loadRefs = () => {
    api.get('/admin/departments').then(({ data }) => setDepartments(data.items || [])).catch(() => {});
    api.get('/admin/sla-plans').then(({ data }) => setSlaPlans(data.items || data.slaPlans || [])).catch(() => {});
    api.get('/admin/agents').then(({ data }) => setAgents(data.agents || data.items || [])).catch(() => {});
    api.get('/admin/teams').then(({ data }) => setTeams(data.items || data.teams || [])).catch(() => {});
    api.get('/admin/priorities').then(({ data }) => setPriorities(data.items || [])).catch(() => {});
  };
  useEffect(() => {
    load();
    loadRefs();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, parent: form.parent || null, autoresponder: form.autoresponder };
      if (editing) await api.put(`/admin/help-topics/${editing._id}`, body);
      else await api.post('/admin/help-topics', body);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete help topic "${item.topic}"?`)) return;
    try { await api.delete(`/admin/help-topics/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const openEdit = (item) => {
    setForm({
      ...item,
      department: item.department?._id || '',
      sla: item.sla?._id || '',
      autoAssignAgent: item.autoAssignAgent?._id || '',
      autoAssignTeam: item.autoAssignTeam?._id || '',
      parent: item.parent?._id || '',
      autoresponder: item.autoresponder || { enabled: false, subject: '', body: '' },
    });
    setEditing(item);
    setShowForm(true);
  };

  const newForm = () => {
    setForm({ topic: '', category: '', parent: '', department: '', priority: 'Normal', sla: '', autoAssignAgent: '', autoAssignTeam: '', autoresponder: { enabled: false, subject: '', body: '' }, status: 'active', isPublic: true });
    setEditing(null);
    setShowForm(true);
  };

  const ar = form.autoresponder || {};

  return (
    <div className="box">
      <div className="box-header">
        <h1>Help Topics</h1>
        <button className="btn small" onClick={newForm}>Add Help Topic</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <form onSubmit={save} style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="field"><label>Help Topic Name *</label>
              <input value={form.topic || ''} onChange={(e) => setForm({ ...form, topic: e.target.value })} required /></div>
            <div className="field"><label>Category</label>
              <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="field"><label>Parent Topic</label>
              <select value={form.parent || ''} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                <option value="">None</option>
                {items.filter((t) => !editing || t._id !== editing._id).map((t) => <option key={t._id} value={t._id}>{t.topic}</option>)}
              </select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Department</label>
              <select value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">None</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select></div>
            <div className="field"><label>Priority</label>
              <select value={form.priority || 'Normal'} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {priorities.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select></div>
            <div className="field"><label>SLA Plan</label>
              <select value={form.sla || ''} onChange={(e) => setForm({ ...form, sla: e.target.value })}>
                <option value="">None</option>
                {slaPlans.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Auto-Assign Agent</label>
              <select value={form.autoAssignAgent || ''} onChange={(e) => setForm({ ...form, autoAssignAgent: e.target.value })}>
                <option value="">None</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select></div>
            <div className="field"><label>Auto-Assign Team</label>
              <select value={form.autoAssignTeam || ''} onChange={(e) => setForm({ ...form, autoAssignTeam: e.target.value })}>
                <option value="">None</option>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select></div>
            <div className="field"><label>Status</label>
              <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option><option value="disabled">Disabled</option>
              </select></div>
          </div>
          <div className="field"><label>Custom Response / Autoresponder</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={!!ar.enabled}
                onChange={(e) => setForm({ ...form, autoresponder: { ...ar, enabled: e.target.checked } })} />
              Enable custom autoresponse for this topic
            </label></div>
          {ar.enabled && (
            <div className="form-row">
              <div className="field"><label>Subject (supports %{ticket.subject}, %{ticket.number})</label>
                <input value={ar.subject || ''} onChange={(e) => setForm({ ...form, autoresponder: { ...ar, subject: e.target.value } })} /></div>
            </div>
          )}
          {ar.enabled && (
            <div className="field"><label>Response Body (supports %{user.name}, %{ticket.subject}, %{ticket.number}, %{dept.name}, %{topic.name}, %{company.name})</label>
              <textarea rows={4} value={ar.body || ''} onChange={(e) => setForm({ ...form, autoresponder: { ...ar, body: e.target.value } })} /></div>
          )}
          <div className="buttons">
            <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
            <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
          </div>
        </form>
      )}
      <table className="list">
        <thead><tr><th>Help Topic</th><th>Category</th><th>Parent</th><th>Department</th><th>Priority</th><th>SLA Plan</th><th>Autoresponse</th><th>Status</th><th style={{ width: 150 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td><strong>{t.topic}</strong></td>
              <td>{t.category || '—'}</td>
              <td>{t.parent?.topic || '—'}</td>
              <td>{t.department?.name || '—'}</td>
              <td>{t.priority}</td>
              <td>{t.sla?.name || '—'}</td>
              <td>{t.autoresponder?.enabled ? 'Custom' : 'Default'}</td>
              <td><span className={`pill ${t.status === 'active' ? 'green' : 'gray'}`}>{t.status}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => openEdit(t)}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(t)}>Delete</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={9} className="muted center">No help topics found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}