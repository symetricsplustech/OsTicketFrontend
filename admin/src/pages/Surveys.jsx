import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

export default function Surveys() {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [aggs, setAggs] = useState([]);
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: 'csat', question: '', scale: 5, trigger: 'on_close', isActive: true, sendTo: 'user', followUpAfterHours: 0, customMessage: '' });

  const load = async () => {
    try {
      const [sv, rs] = await Promise.all([
        adminEn.surveys(),
        adminEn.surveyResults().catch(() => ({ analytics: {}, items: [] })),
      ]);
      const rows = Object.values(rs.analytics?.byType || {}).map((a) => ({
        _id: a.surveyId, name: a.name, sent: 0, responses: a.responses, average: a.average, recent: a.recent || [],
      }));
      setItems(sv); setAggs(rows); setRawItems(rs.items || []); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await adminEn.createSurvey(form); setForm({ name: '', type: 'csat', question: '', scale: 5, trigger: 'on_close', isActive: true, sendTo: 'user', followUpAfterHours: 0, customMessage: '' }); await load(); }
    catch (e) { setError(e.message); }
  };

  const toggle = async (s) => { await adminEn.updateSurvey(s._id, { isActive: !s.isActive }); await load(); };
  const remove = async (s) => { if (!window.confirm('Delete survey?')) return; await adminEn.deleteSurvey(s._id); await load(); };

  const F = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

  return (
    <div>
      <h1>CSAT / NPS Surveys</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>New Survey</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Post-close CSAT" /></F>
          <F label="Type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['csat', 'nps', 'ces'].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select></F>
          <F label="Scale"><select value={form.scale} onChange={(e) => setForm({ ...form, scale: +e.target.value })}>
            <option value={5}>1-5</option><option value={10}>0-10</option>
          </select></F>
          <F label="Trigger"><select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
            {['on_close', 'on_resolution', 'manual'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select></F>
        </div>
        <div className="form-row">
          <F label="Question"><input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="How satisfied were you with the support you received?" /></F>
          <F label="Sent To"><select value={form.sendTo} onChange={(e) => setForm({ ...form, sendTo: e.target.value })}>
            <option value="user">End user</option><option value="org">Organization</option>
          </select></F>
          <F label="Follow-up (hours)"><input type="number" value={form.followUpAfterHours} onChange={(e) => setForm({ ...form, followUpAfterHours: +e.target.value })} /></F>
        </div>
        <div className="form-row">
          <F label="Custom Message"><input value={form.customMessage} onChange={(e) => setForm({ ...form, customMessage: e.target.value })} /></F>
          <div className="field"><span></span><button className="btn" onClick={save}>Create</button></div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Surveys ({items.length})</h1></div>
        <table className="list">
          <thead><tr><th>Name</th><th>Type</th><th>Question</th><th>Trigger</th><th>Sent</th><th>Responses</th><th>Avg</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {items.map((s) => {
              const agg = aggs.find((a) => String(a._id) === String(s._id));
              return (
                <tr key={s._id}>
                  <td><b>{s.name}</b></td>
                  <td><span className="pill">{s.type.toUpperCase()}</span></td>
                  <td>{s.question || '—'}</td>
                  <td>{s.trigger}</td>
                  <td>{agg?.sent ?? 0}</td>
                  <td>{agg?.responses ?? 0}</td>
                  <td>{agg?.average != null ? agg.average.toFixed(1) : '—'}</td>
                  <td><span className={`pill ${s.isActive ? '' : 'muted'}`}>{s.isActive ? 'active' : 'paused'}</span></td>
                  <td className="right">
                    <button className="btn secondary" onClick={() => toggle(s)}>{s.isActive ? 'Pause' : 'Activate'}</button>{' '}
                    <button className="btn danger" onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={9} className="muted">No surveys.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Recent Responses</h1></div>
        <table className="list">
          <thead><tr><th>Ticket</th><th>User</th><th>Survey</th><th>Rating</th><th>Comment</th><th>At</th></tr></thead>
          <tbody>
            {rawItems.map((x) => (
              <tr key={x._id}>
                <td>#{x.ticket?.number || '—'}</td>
                <td>{x.user?.name || x.user?.email || '—'}</td>
                <td>{x.survey?.name || '—'}</td>
                <td><span className="pill">{x.rating != null ? `${x.rating}/${x.scale || 5}` : '—'}</span></td>
                <td>{x.comment || <em className="muted">no comment</em>}</td>
                <td>{x.respondedAt ? new Date(x.respondedAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {rawItems.length === 0 && <tr><td colSpan={6} className="muted">No responses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}