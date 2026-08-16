import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

export default function Skills() {
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const load = async () => {
    try {
      const [sk, ag] = await Promise.all([adminEn.skills(), adminEn.agents()]);
      setItems(sk); setAgents(ag); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    try { await adminEn.createSkill(form); setForm({ name: '', description: '' }); await load(); }
    catch (e) { setError(e.message); }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete skill "${s.name}"?`)) return;
    await adminEn.deleteSkill(s._id); await load();
  };

  const toggleAgentSkill = async (agent, skillId, add) => {
    const next = add ? [...(agent.skills || []), skillId] : (agent.skills || []).filter((s) => String(s) !== String(skillId));
    await adminEn.assignSkills(agent._id, next); await load();
  };

  const skillName = (id) => items.find((s) => String(s._id) === String(id))?.name || '—';

  return (
    <div>
      <h1>Skills & Routing</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>New Skill</h1></div>
        <div className="form-row">
          <label className="field"><span>Skill Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Networking, PCI-DSS, Billing" />
          </label>
          <label className="field"><span>Description</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <button className="btn" onClick={create}>Add Skill</button>
        </div>
        <p className="muted small">Routing algorithm: <b>skill-based</b> (set in System Settings → routing). Tickets are auto-assigned to the best available agent by skill match, presence and load.</p>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Skills ({items.length})</h1></div>
        {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No skills defined.</p> : (
          <table className="list">
            <thead><tr><th>Name</th><th>Description</th><th>Agents</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id}>
                  <td><b>{s.name}</b></td>
                  <td>{s.description || '—'}</td>
                  <td>{agents.filter((a) => (a.skills || []).some((x) => String(x) === String(s._id))).map((a) => a.name).join(', ') || <em className="muted">none assigned</em>}</td>
                  <td className="right"><button className="btn danger" onClick={() => remove(s)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Agent Skill Assignment</h1></div>
        <table className="list">
          <thead><tr><th>Agent</th><th>Department</th><th>Skills</th></tr></thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.departments?.map?.((d) => d.department?.name).join(', ') || '—'}</td>
                <td>
                  {items.map((s) => {
                    const on = (a.skills || []).some((x) => String(x) === String(s._id));
                    return (
                      <button key={s._id} className={`pill ${on ? '' : 'muted'}`} style={{ cursor: 'pointer', marginRight: 4 }}
                        onClick={() => toggleAgentSkill(a, s._id, !on)}>
                        {on ? '✓' : '+'} {s.name}
                      </button>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}