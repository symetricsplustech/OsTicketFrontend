import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function Teams() {
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', lead: '', members: [], status: 'active' });
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchBy, setMemberSearchBy] = useState('name');

  const filteredAgents = agents.filter((a) => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;
    const field = memberSearchBy === 'email' ? (a.email || '') : (a.name || '');
    return field.toLowerCase().includes(q);
  });

  const load = () => {
    api.get('/admin/teams').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
    api.get('/admin/agents').then(({ data }) => setAgents(data.items)).catch(() => {});
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/teams/${editing._id}`, form);
      else await api.post('/admin/teams', form);
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this team?')) return;
    try { await api.delete(`/admin/teams/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Teams</h1>
        <button className="btn small" onClick={() => { setForm({ name: '', lead: '', members: [], status: 'active' }); setEditing(null); setShowForm(true); }}>Add Team</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? 'Edit Team' : 'Add Team'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Team Lead</label>
                <select value={form.lead || ''} onChange={(e) => setForm({ ...form, lead: e.target.value })}>
                  <option value="">None</option>
                  {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select></div>
              <div className="field"><label>Status</label>
                <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="disabled">Disabled</option>
                </select></div>
            </div>
            <div className="field"><label>Members <span className="small muted">({(form.members || []).length} selected — select as many as you want)</span></label>
              <div className="member-picker">
                <div className="member-picker-toolbar">
                  <select className="member-search-by" value={memberSearchBy} onChange={(e) => setMemberSearchBy(e.target.value)}>
                    <option value="name">Search by Name</option>
                    <option value="email">Search by Email</option>
                  </select>
                  <input
                    type="text"
                    className="member-search"
                    placeholder={memberSearchBy === 'email' ? 'Search by email…' : 'Search by name…'}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  <button type="button" className="btn small secondary" onClick={() => setForm({ ...form, members: agents.map((a) => a._id) })}>Select All</button>
                  <button type="button" className="btn small secondary" onClick={() => setForm({ ...form, members: [] })}>Clear</button>
                </div>
                <div className="member-list">
                  {filteredAgents.map((a) => (
                    <label className="member-option" key={a._id}>
                      <input
                        type="checkbox"
                        checked={(form.members || []).includes(a._id)}
                        onChange={(e) => setForm({
                          ...form,
                          members: e.target.checked
                            ? [...(form.members || []), a._id]
                            : (form.members || []).filter((id) => id !== a._id),
                        })}
                      />
                      <span>{a.name}</span>
                      <em className="muted">{a.email}</em>
                    </label>
                  ))}
                  {filteredAgents.length === 0 && <span className="small muted member-empty">{memberSearch ? `No agents match "${memberSearch}".` : 'No agents available yet.'}</span>}
                </div>
              </div>
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Lead</th><th>Members</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td><strong>{t.name}</strong></td>
              <td>{t.lead?.name || '—'}</td>
              <td>{t.members?.map((m) => m.name).join(', ') || '—'}</td>
              <td><span className={`pill ${t.status === 'active' ? 'green' : 'gray'}`}>{t.status}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(t); setForm({ name: t.name, lead: t.lead?._id || '', members: t.members?.map((m) => m._id) || [], status: t.status }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
