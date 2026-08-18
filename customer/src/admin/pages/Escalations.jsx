import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

const PRIORITIES = ['Low', 'Normal', 'High', 'Emergency'];
const STATUS_OPTS = ['open', 'assigned', 'overdue'];

const emptyForm = () => ({
  name: '', department: '', priority: '', statuses: ['open', 'assigned', 'overdue'],
  overdueMinutes: 0, raisePriorityTo: '', reassignAgent: '', reassignTeam: '', notifyAgent: '', isActive: true,
});

export default function Escalations() {
  const [items, setItems] = useState([]);
  const [dir, setDir] = useState({ agents: [], teams: [], departments: [] });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = () => {
    api.get('/agent/escalations').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(() => {
    load();
    api.get('/agent/directory').then(({ data }) => setDir(data)).catch(() => {});
  }, []);

  const toggleStatus = (s) =>
    setForm((f) => ({ ...f, statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s] }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Rule name is required');
    const payload = {
      name: form.name, department: form.department || null, priority: form.priority || null,
      statuses: form.statuses, overdueMinutes: Number(form.overdueMinutes) || 0, isActive: form.isActive,
      action: {
        raisePriorityTo: form.raisePriorityTo || null,
        reassignAgent: form.reassignAgent || null,
        reassignTeam: form.reassignTeam || null,
        notifyAgent: form.notifyAgent || null,
      },
    };
    try {
      if (editing) await api.put(`/agent/escalations/${editing._id}`, payload);
      else await api.post('/agent/escalations', payload);
      setShowForm(false); setEditing(null); setError(''); load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (r) => {
    if (!window.confirm('Delete this escalation rule?')) return;
    try { await api.delete(`/agent/escalations/${r._id}`); load(); } catch (err) { setError(err.message); }
  };

  const startEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name, department: r.department?._id || r.department || '', priority: r.priority || '',
      statuses: r.statuses, overdueMinutes: r.overdueMinutes || 0,
      raisePriorityTo: r.action?.raisePriorityTo || '',
      reassignAgent: r.action?.reassignAgent?._id || r.action?.reassignAgent || '',
      reassignTeam: r.action?.reassignTeam?._id || r.action?.reassignTeam || '',
      notifyAgent: r.action?.notifyAgent?._id || r.action?.notifyAgent || '',
      isActive: r.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Escalation Rules</h1>
        <button className="btn small" onClick={() => { setEditing(null); setForm(emptyForm()); setShowForm(true); }}>Add Rule</button>
      </div>
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="form-panel">
          <h2>{editing ? 'Edit Escalation Rule' : 'Add Escalation Rule'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Rule Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Any</option>
                  {dir.departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Ticket Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="">Any</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Statuses</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {STATUS_OPTS.map((s) => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="checkbox" checked={form.statuses.includes(s)} onChange={() => toggleStatus(s)} /> {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field"><label>Overdue After (minutes, 0 = any)</label>
                <input type="number" min="0" value={form.overdueMinutes} onChange={(e) => setForm({ ...form, overdueMinutes: e.target.value })} /></div>
            </div>
            <h2>Action</h2>
            <div className="form-row">
              <div className="field"><label>Raise Priority To</label>
                <select value={form.raisePriorityTo} onChange={(e) => setForm({ ...form, raisePriorityTo: e.target.value })}>
                  <option value="">—</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field"><label>Reassign Agent</label>
                <select value={form.reassignAgent} onChange={(e) => setForm({ ...form, reassignAgent: e.target.value })}>
                  <option value="">—</option>
                  {dir.agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Reassign Team</label>
                <select value={form.reassignTeam} onChange={(e) => setForm({ ...form, reassignTeam: e.target.value })}>
                  <option value="">—</option>
                  {dir.teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Notify Agent</label>
                <select value={form.notifyAgent} onChange={(e) => setForm({ ...form, notifyAgent: e.target.value })}>
                  <option value="">—</option>
                  {dir.agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
            <div className="buttons mt-10">
              <button className="btn small" type="submit">{editing ? 'Save' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <p className="muted">No escalation rules yet. Rules auto-run every few minutes and can raise priority, reassign, or notify an agent.</p>
      ) : (
        <table className="list">
          <thead>
            <tr><th>Name</th><th>Dept</th><th>Priority</th><th>Statuses</th><th>Overdue</th><th>Action</th><th>Active</th><th style={{ width: 130 }}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.department?.name || 'All'}</td>
                <td>{r.priority || 'Any'}</td>
                <td>{r.statuses.join(', ')}</td>
                <td>{r.overdueMinutes > 0 ? `${r.overdueMinutes}m` : '—'}</td>
                <td className="small">
                  {[
                    r.action.raisePriorityTo ? `raise→${r.action.raisePriorityTo}` : null,
                    r.action.reassignAgent ? `→ ${r.action.reassignAgent.name}` : null,
                    r.action.reassignTeam ? `team→ ${r.action.reassignTeam.name}` : null,
                    r.action.notifyAgent ? `notify ${r.action.notifyAgent.name}` : null,
                  ].filter(Boolean).join(', ') || '—'}
                </td>
                <td><span className={`pill ${r.isActive ? 'green' : 'gray'}`}>{r.isActive ? 'on' : 'off'}</span></td>
                <td>
                  <button className="btn small secondary" onClick={() => startEdit(r)}>Edit</button>{' '}
                  <button className="btn small danger" onClick={() => del(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
