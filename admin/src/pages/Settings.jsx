import React, { useState } from 'react';
import { api } from '../lib/index.js';

export default function Settings() {
  const [refs, setRefs] = useState({ depts: [], slas: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useState(() => {
    api.get('/admin/settings').then(({ data }) => setRefs(data.refs)).catch((e) => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const fd = new FormData(e.target);
      const values = {
        defaultDept: fd.get('defaultDept'),
        defaultSla: fd.get('defaultSla'),
        defaultPriority: fd.get('defaultPriority'),
        defaultTicketNumberFormat: fd.get('defaultTicketNumberFormat'),
        autoLockTickets: fd.get('autoLockTickets') === 'on',
        ticketLockMinutes: fd.get('ticketLockMinutes'),
        allowTicketReopen: fd.get('allowTicketReopen') === 'on',
        maxOpenTickets: fd.get('maxOpenTickets'),
        enableKb: fd.get('enableKb') === 'on',
        enableAnnouncements: fd.get('enableAnnouncements') === 'on',
        registrationEnabled: fd.get('registrationEnabled') === 'on',
      };
      await api.put('/admin/settings', { section: 'system', values });
      setMessage('System settings saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>System Settings</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        <div className="form-panel">
          <h2>Defaults</h2>
          <div className="form-row">
            <div className="field"><label>Default Department</label>
              <select name="defaultDept">
                <option value="">None</option>
                {refs.depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select></div>
            <div className="field"><label>Default SLA Plan</label>
              <select name="defaultSla">
                <option value="">None</option>
                {refs.slas.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select></div>
            <div className="field"><label>Default Priority</label>
              <select name="defaultPriority">
                <option>Low</option><option>Normal</option><option>High</option><option>Emergency</option>
              </select></div>
            <div className="field"><label>Ticket Number Format</label>
              <input type="text" name="defaultTicketNumberFormat" defaultValue="0" /></div>
          </div>
        </div>
        <div className="form-panel">
          <h2>Ticket Behavior</h2>
          <div className="field"><label><input type="checkbox" name="autoLockTickets" defaultChecked /> Auto-lock tickets to prevent concurrent responses</label></div>
          <div className="form-row">
            <div className="field"><label>Lock Duration (minutes)</label><input type="number" name="ticketLockMinutes" defaultValue="5" /></div>
            <div className="field"><label>Max Open Tickets per User (0 = unlimited)</label><input type="number" name="maxOpenTickets" defaultValue="0" /></div>
          </div>
          <div className="field"><label><input type="checkbox" name="allowTicketReopen" defaultChecked /> Allow customers to reopen closed tickets</label></div>
        </div>
        <div className="form-panel">
          <h2>Features</h2>
          <div className="field"><label><input type="checkbox" name="enableKb" defaultChecked /> Enable Knowledgebase</label></div>
          <div className="field"><label><input type="checkbox" name="enableAnnouncements" defaultChecked /> Enable Announcements</label></div>
          <div className="field"><label><input type="checkbox" name="registrationEnabled" defaultChecked /> Enable user registration</label></div>
        </div>
        <div className="buttons"><button className="btn" type="submit">Save Settings</button></div>
      </form>
    </div>
  );
}
