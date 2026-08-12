import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';
import Modal from '../components/Modal.jsx';

const PRIORITIES = ['Low', 'Normal', 'High', 'Emergency'];
const STATUS_OPTS = ['open', 'assigned', 'overdue'];

export default function Escalations() {
  const [items, setItems] = useState([]);
  const [dir, setDir] = useState({ agents: [], teams: [], departments: [] });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get('/agent/escalations').then(({ data }) => setItems(data.items)).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    api.get('/agent/directory').then(({ data }) => setDir(data)).catch(() => {});
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this escalation rule?')) return;
    try {
      await api.delete(`/agent/escalations/${id}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Escalation Rules</h1>
        <button className="btn small" onClick={() => setEditing({ name: '', statuses: ['open', 'assigned', 'overdue'] })}>+ New Rule</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {items.length === 0 ? (
        <p className="muted">No escalation rules yet. Rules auto-run every few minutes and can raise priority, reassign, or notify an agent.</p>
      ) : (
        <table className="list">
          <thead>
            <tr><th>Name</th><th>Dept</th><th>Priority</th><th>Statuses</th><th>Overdue</th><th>Action</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
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
                <td>{r.isActive ? <span className="pill" style={{ background: '#e4f5ec', color: '#1a7f37' }}>on</span> : <span className="pill" style={{ background: '#eee', color: '#666' }}>off</span>}</td>
                <td>
                  <button className="btn small secondary" onClick={() => setEditing(r)}>Edit</button>{' '}
                  <button className="btn small danger" onClick={() => remove(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <RuleModal
          rule={editing}
          dir={dir}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function RuleModal({ rule, dir, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: rule.name || '',
    department: rule.department?._id || rule.department || '',
    priority: rule.priority || '',
    statuses: rule.statuses || ['open'],
    overdueMinutes: rule.overdueMinutes || 0,
    raisePriorityTo: rule.action?.raisePriorityTo || '',
    reassignAgent: rule.action?.reassignAgent?._id || rule.action?.reassignAgent || '',
    reassignTeam: rule.action?.reassignTeam?._id || rule.action?.reassignTeam || '',
    notifyAgent: rule.action?.notifyAgent?._id || rule.action?.notifyAgent || '',
    isActive: rule.isActive !== undefined ? rule.isActive : true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggleStatus = (s) => {
    setForm((f) => ({
      ...f,
      statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s],
    }));
  };

  const save = async () => {
    if (!form.name.trim()) return setError('Rule name is required');
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        department: form.department || null,
        priority: form.priority || null,
        statuses: form.statuses,
        overdueMinutes: Number(form.overdueMinutes) || 0,
        isActive: form.isActive,
        action: {
          raisePriorityTo: form.raisePriorityTo || null,
          reassignAgent: form.reassignAgent || null,
          reassignTeam: form.reassignTeam || null,
          notifyAgent: form.notifyAgent || null,
        },
      };
      if (rule._id) await api.put(`/agent/escalations/${rule._id}`, payload);
      else await api.post('/agent/escalations', payload);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={rule._id ? 'Edit Escalation Rule' : 'New Escalation Rule'} onClose={onClose}
      footer={<>
        <button className="btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </>}>
      {error && <div className="alert error">{error}</div>}
      <div className="field"><label>Rule Name <span className="req">*</span></label>
        <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
      <div className="form-row">
        <div className="field"><label>Department</label>
          <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
            <option value="">Any</option>
            {dir.departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Ticket Priority</label>
          <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option value="">Any</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Statuses</label>
        <div className="form-row">
          {STATUS_OPTS.map((s) => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={form.statuses.includes(s)} onChange={() => toggleStatus(s)} /> {s}
            </label>
          ))}
        </div>
      </div>
      <div className="field"><label>Overdue After (minutes, 0 = any)</label>
        <input type="number" min="0" value={form.overdueMinutes} onChange={(e) => setForm((f) => ({ ...f, overdueMinutes: e.target.value }))} /></div>
      <hr />
      <p className="small muted">Action when rule matches:</p>
      <div className="form-row">
        <div className="field"><label>Raise Priority To</label>
          <select value={form.raisePriorityTo} onChange={(e) => setForm((f) => ({ ...f, raisePriorityTo: e.target.value }))}>
            <option value="">—</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field"><label>Reassign Agent</label>
          <select value={form.reassignAgent} onChange={(e) => setForm((f) => ({ ...f, reassignAgent: e.target.value }))}>
            <option value="">—</option>
            {dir.agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field"><label>Reassign Team</label>
          <select value={form.reassignTeam} onChange={(e) => setForm((f) => ({ ...f, reassignTeam: e.target.value }))}>
            <option value="">—</option>
            {dir.teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Notify Agent</label>
          <select value={form.notifyAgent} onChange={(e) => setForm((f) => ({ ...f, notifyAgent: e.target.value }))}>
            <option value="">—</option>
            {dir.agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
      </label>
    </Modal>
  );
}
