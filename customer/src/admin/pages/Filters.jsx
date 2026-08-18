import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function Filters() {
  const [items, setItems] = useState([]);
  const [depts, setDepts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [slaPlans, setSlaPlans] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', match: 'all', status: 'active', order: 0, rules: [], actions: [] });

  const load = () => {
    api.get('/admin/filters').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
    api.get('/admin/departments').then(({ data }) => setDepts(data.items)).catch(() => {});
    api.get('/admin/agents').then(({ data }) => setAgents(data.items)).catch(() => {});
    api.get('/admin/teams').then(({ data }) => setTeams(data.items)).catch(() => {});
    api.get('/admin/sla-plans').then(({ data }) => setSlaPlans(data.items)).catch(() => {});
  };
  useEffect(load, []);

  const addRule = () => setForm((f) => ({ ...f, rules: [...f.rules, { field: 'subject', method: 'contains', value: '' }] }));
  const updRule = (i, k, v) => setForm((f) => ({ ...f, rules: f.rules.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const delRule = (i) => setForm((f) => ({ ...f, rules: f.rules.filter((_, j) => j !== i) }));
  const addAction = () => setForm((f) => ({ ...f, actions: [...f.actions, { action: 'dept', target: '' }] }));
  const updAction = (i, k, v) => setForm((f) => ({ ...f, actions: f.actions.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const delAction = (i) => setForm((f) => ({ ...f, actions: f.actions.filter((_, j) => j !== i) }));

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/filters/${editing._id}`, form);
      else await api.post('/admin/filters', form);
      setShowForm(false); setEditing(null); load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm('Delete this filter?')) return;
    try { await api.delete(`/admin/filters/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  const targetOptions = (action) => {
    if (action === 'dept') return depts.map((d) => ({ value: d._id, label: d.name }));
    if (action === 'agent') return agents.map((a) => ({ value: a._id, label: a.name }));
    if (action === 'team') return teams.map((t) => ({ value: t._id, label: t.name }));
    if (action === 'sla') return slaPlans.map((s) => ({ value: s._id, label: s.name }));
    if (action === 'priority') return ['Low', 'Normal', 'High', 'Emergency'].map((p) => ({ value: p, label: p }));
    return [{ value: '', label: 'No options' }];
  };

  const ACTION_LABELS = {
    dept: 'Department',
    agent: 'Assign Agent',
    team: 'Assign Team',
    sla: 'Set SLA',
    priority: 'Set Priority',
    reject: 'Reject',
    canned_response: 'Canned Response',
  };

  const actionText = (a) => {
    const label = ACTION_LABELS[a.action] || a.action;
    if (a.action === 'reject') return label;
    const target = a.target ? String(a.target) : '';
    if (!target) return label;
    const name = (targetOptions(a.action).find((o) => String(o.value) === target) || {}).label;
    return `${label}: ${name || target}`;
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Ticket Filters</h1>
        <button className="btn small" onClick={() => { setForm({ name: '', match: 'all', status: 'active', order: 0, rules: [], actions: [] }); setEditing(null); setShowForm(true); }}>Add Filter</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showForm && (
        <div className="form-panel">
          <h2>{editing ? 'Edit Filter' : 'Add Filter'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Filter Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Match</label>
                <select value={form.match} onChange={(e) => setForm({ ...form, match: e.target.value })}>
                  <option value="all">All rules</option><option value="any">Any rule</option>
                </select></div>
              <div className="field"><label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="disabled">Disabled</option>
                </select></div>
              <div className="field"><label>Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            </div>

            <h2>Rules</h2>
            {form.rules.map((r, i) => (
              <div key={i} className="field" style={{ display: 'flex', gap: 8 }}>
                <select value={r.field} onChange={(e) => updRule(i, 'field', e.target.value)} style={{ width: 130 }}>
                  <option value="subject">Subject</option><option value="body">Message Body</option>
                  <option value="from">Email</option><option value="name">Name</option>
                  <option value="priority">Priority</option><option value="topic">Help Topic</option>
                </select>
                <select value={r.method} onChange={(e) => updRule(i, 'method', e.target.value)} style={{ width: 130 }}>
                  <option value="contains">contains</option><option value="equals">equals</option>
                  <option value="starts_with">starts with</option><option value="ends_with">ends with</option>
                </select>
                <input type="text" value={r.value} onChange={(e) => updRule(i, 'value', e.target.value)} placeholder="value" />
                <button type="button" className="btn small danger" onClick={() => delRule(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn small secondary" onClick={addRule}>+ Add Rule</button>

            <h2 className="mt-10">Actions</h2>
            {form.actions.map((a, i) => (
              <div key={i} className="field" style={{ display: 'flex', gap: 8 }}>
                <select value={a.action} onChange={(e) => updAction(i, 'action', e.target.value)} style={{ width: 170 }}>
                  <option value="dept">Set Department</option><option value="agent">Assign to Agent</option>
                  <option value="team">Assign to Team</option><option value="sla">Set SLA</option><option value="priority">Set Priority</option>
                  <option value="reject">Reject Ticket</option>
                </select>
                {a.action !== 'reject' && (
                  <select value={a.target} onChange={(e) => updAction(i, 'target', e.target.value)} style={{ width: 170 }}>
                    <option value="">Select…</option>
                    {targetOptions(a.action).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
                <button type="button" className="btn small danger" onClick={() => delAction(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn small secondary" onClick={addAction}>+ Add Action</button>

            <div className="buttons mt-10">
              <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Match</th><th>Rules</th><th>Actions</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((f) => (
            <tr key={f._id}>
              <td><strong>{f.name}</strong></td>
              <td>{f.match}</td>
              <td className="small">{f.rules.map((r) => `${r.field} ${r.method} "${r.value}"`).join(', ') || '—'}</td>
              <td className="small">{f.actions.map(actionText).join(', ') || '—'}</td>
              <td><span className={`pill ${f.status === 'active' ? 'green' : 'gray'}`}>{f.status}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => { setEditing(f); setForm({ name: f.name, match: f.match, status: f.status, order: f.order, rules: f.rules.map((r) => ({ ...r })), actions: f.actions.map((a) => ({ ...a })) }); setShowForm(true); }}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => del(f)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
