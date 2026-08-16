import { useEffect, useState } from 'react';
import { adminEn, WORKFLOW_EVENTS, WORKFLOW_ACTIONS } from '../lib/enterprise.js';

export default function Workflows() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', event: 'ticket.created', active: true,
    conditions: [{ field: 'ticket.priority', operator: 'equals', value: 'high' }],
    actions: [{ type: 'notify_agent', value: 'High priority ticket routed' }],
  });
  const [testResult, setTestResult] = useState(null);

  const load = () => adminEn.workflows().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const startEdit = (wf) => {
    setEditing(wf._id);
    setTestResult(null);
    setForm({ ...wf, conditions: wf.conditions || [], actions: wf.actions || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    try {
      if (editing) { await adminEn.updateWorkflow(editing, form); } else { await adminEn.createWorkflow(form); }
      setEditing(null); setError(''); await load();
    } catch (e) { setError(e.message); }
  };

  const test = async () => {
    try {
      setTestResult(await adminEn.testWorkflow('__fixture__', form));
    } catch (e) { setTestResult(e.details || e.message); }
  };

  const toggle = async (wf) => {
    await adminEn.updateWorkflow(wf._id, { active: !wf.active });
    await load();
  };

  const remove = async (wf) => {
    if (!window.confirm(`Delete workflow "${wf.name}"?`)) return;
    await adminEn.deleteWorkflow(wf._id);
    await load();
  };

  const F = ({ label, children }) => (
    <label className="field"><span>{label}</span>{children}</label>
  );

  return (
    <div>
      <h1>Workflow Automation</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>{editing ? 'Edit Workflow' : 'New Workflow'}</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. High priority SLA escalation" /></F>
          <F label="Event"><select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
            {WORKFLOW_EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select></F>
          <F label="Active"><select value={form.active ? '1' : '0'} onChange={(e) => setForm({ ...form, active: e.target.value === '1' })}>
            <option value="1">Yes</option><option value="0">No</option>
          </select></F>
        </div>
        <div className="form-row">
          <F label="Description"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
        </div>

        <div className="box-header mt-10"><h1>Conditions</h1></div>
        {form.conditions.map((c, i) => (
          <div key={i} className="form-row">
            <F label="Field">
              <select value={c.field} onChange={(e) => setForm({ ...form, conditions: form.conditions.map((x, j) => j === i ? { ...x, field: e.target.value } : x) })}>
                <option value="ticket.priority">ticket.priority</option>
                <option value="ticket.dept">ticket.dept</option>
                <option value="ticket.help_topic">ticket.help_topic</option>
                <option value="ticket.agent">ticket.agent</option>
                <option value="user.organization">user.organization</option>
              </select>
            </F>
            <F label="Operator">
              <select value={c.operator} onChange={(e) => setForm({ ...form, conditions: form.conditions.map((x, j) => j === i ? { ...x, operator: e.target.value } : x) })}>
                <option value="equals">equals</option>
                <option value="not_equal">not equal</option>
                <option value="contains">contains</option>
                <option value="regex">regex</option>
                <option value="in">in</option>
              </select>
            </F>
            <F label="Value"><input value={c.value} onChange={(e) => setForm({ ...form, conditions: form.conditions.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} /></F>
            <button className="btn danger" onClick={() => setForm({ ...form, conditions: form.conditions.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className="btn secondary" onClick={() => setForm({ ...form, conditions: [...form.conditions, { field: 'ticket.priority', operator: 'equals', value: '' }] })}>+ Condition</button>

        <div className="box-header mt-10"><h1>Actions</h1></div>
        {form.actions.map((a, i) => (
          <div key={i} className="form-row">
            <F label="Action">
              <select value={a.type} onChange={(e) => setForm({ ...form, actions: form.actions.map((x, j) => j === i ? { ...x, type: e.target.value } : x) })}>
                {WORKFLOW_ACTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
            <F label="Value"><input value={a.value} onChange={(e) => setForm({ ...form, actions: form.actions.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} />
            </F>
            <button className="btn danger" onClick={() => setForm({ ...form, actions: form.actions.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className="btn secondary" onClick={() => setForm({ ...form, actions: [...form.actions, { type: 'notify_agent', value: '' }] })}>+ Action</button>

        <div className="buttons mt-10">
          {editing && <button className="btn secondary" onClick={() => { setEditing(null); setTestResult(null); }}>Cancel</button>}
          <button className="btn" onClick={save}>Save Workflow</button>
          <button className="btn secondary" onClick={test}>Dry-Run Test</button>
        </div>
        {testResult && (
          <div className="box mt-10">
            <div className="box-header"><h1>Test Result</h1></div>
            <pre style={{ fontSize: 12 }}>{typeof testResult === 'string' ? testResult : JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Automation Rules ({items.length})</h1></div>
        {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No workflows yet.</p> : (
          <table className="list">
            <thead><tr><th>Name</th><th>Event</th><th>Conditions</th><th>Actions</th><th>Runs</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {items.map((wf) => (
                <tr key={wf._id}>
                  <td>{wf.name}<div className="muted small">{wf.description}</div></td>
                  <td><span className="pill">{wf.event}</span></td>
                  <td>{(wf.conditions || []).map((c) => `${c.field} ${c.operator} ${c.value}`).join(', ') || '—'}</td>
                  <td>{(wf.actions || []).map((a) => a.type).join(', ')}</td>
                  <td>{wf.runCount || 0}</td>
                  <td><span className={`pill ${wf.active ? '' : 'muted'}`}>{wf.active ? 'active' : 'paused'}</span></td>
                  <td className="right">
                    <button className="btn secondary" onClick={() => startEdit(wf)}>Edit</button>{' '}
                    <button className="btn secondary" onClick={() => toggle(wf)}>{wf.active ? 'Pause' : 'Activate'}</button>{' '}
                    <button className="btn danger" onClick={() => remove(wf)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}