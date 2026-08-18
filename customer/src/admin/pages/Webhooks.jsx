import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

const EVENTS = [
  'ticket.created', 'ticket.updated', 'ticket.assigned', 'ticket.replied', 'ticket.resolved',
  'ticket.closed', 'ticket.overdue', 'customer.replied', 'incident.created', 'incident.updated',
  'contract.expiring', 'approval.completed', 'chat.message', 'csat.response',
];

export default function Webhooks() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', url: '', secret: '', events: ['ticket.created'], isActive: true });

  const load = async () => {
    try {
      const [wh, ev] = await Promise.all([adminEn.webhooks(), adminEn.webhookEvents().catch(() => [])]);
      setItems(wh); setEvents(ev); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await adminEn.createWebhook(form); setForm({ name: '', url: '', secret: '', events: ['ticket.created'], isActive: true }); await load(); }
    catch (e) { setError(e.message); }
  };

  const toggle = async (w) => { await adminEn.updateWebhook(w._id, { isActive: !w.isActive }); await load(); };
  const remove = async (w) => { if (!window.confirm(`Delete webhook "${w.name}"?`)) return; await adminEn.deleteWebhook(w._id); await load(); };

  const F = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

  return (
    <div>
      <h1>Webhooks</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>New Webhook</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Slack alerts" /></F>
          <F label="URL"><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://hook.your-app.com/ost" /></F>
          <F label="Secret"><input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} placeholder="shared secret for X-Ost-Signature" /></F>
        </div>
        <div className="form-row">
          <label className="field"><span>Events</span>
            <select multiple size={4} value={form.events} onChange={(e) => setForm({ ...form, events: [...e.target.selectedOptions].map((o) => o.value) })}>
              {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </label>
          <div className="field"><span></span><button className="btn" onClick={save}>Create Webhook</button></div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Webhooks ({items.length})</h1></div>
        <table className="list">
          <thead><tr><th>Name</th><th>URL</th><th>Events</th><th>Last Delivery</th><th>Failures</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {items.map((w) => (
              <tr key={w._id}>
                <td><b>{w.name}</b></td>
                <td className="muted small">{w.url}</td>
                <td>{(w.events || []).map((e) => <span key={e} className="pill" style={{ marginRight: 4 }}>{e}</span>)}</td>
                <td>{w.lastDeliveryAt ? `${w.lastStatus || 'ok'} · ${new Date(w.lastDeliveryAt).toLocaleString()}` : 'never'}</td>
                <td>{w.failureCount || 0}</td>
                <td><span className={`pill ${w.isActive ? '' : 'muted'}`}>{w.isActive ? 'active' : 'paused'}</span></td>
                <td className="right">
                  <button className="btn secondary" onClick={() => toggle(w)}>{w.isActive ? 'Pause' : 'Activate'}</button>{' '}
                  <button className="btn danger" onClick={() => remove(w)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="muted">No webhooks.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Recent Delivery Log</h1></div>
        <table className="list">
          <thead><tr><th>At</th><th>Webhook</th><th>Event</th><th>Status</th></tr></thead>
          <tbody>
            {events.slice(0, 40).map((ev, i) => (
              <tr key={i}>
                <td>{new Date(ev.at).toLocaleString()}</td>
                <td>{ev.webhookName || '—'}</td>
                <td><span className="pill">{ev.event}</span></td>
                <td><span className={`pill ${ev.status?.startsWith('2') ? '' : 'muted'}`}>{ev.status || 'ok'}</span></td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={4} className="muted">No deliveries logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}