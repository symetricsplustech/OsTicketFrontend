import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/index.js';

const EVENT_LABELS = {
  new_ticket: 'New Ticket',
  assignment: 'Assignment',
  transfer: 'Transfer',
  reply: 'Reply',
  overdue: 'Overdue',
  escalation: 'Escalation',
  mention: 'Mention',
  status_change: 'Status Change',
  closed: 'Closed',
};

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', signature: '', currentPassword: '', password: '' });
  const [prefs, setPrefs] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, signature: user.signature || '' }));
  }, [user]);

  useEffect(() => {
    if (user) setPrefs(user.notificationPrefs || {});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/auth/agent/me', { ...form, notificationPrefs: prefs });
      setMessage('Profile updated successfully.');
      setForm((f) => ({ ...f, currentPassword: '', password: '' }));
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>My Profile</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field"><label>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label>Email (login)</label>
          <input type="email" value={user?.email || ''} disabled /></div>
        <div className="field"><label>Signature</label>
          <textarea value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })} style={{ minHeight: 70 }} /></div>
        <h2>Notification Preferences</h2>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {Object.keys(EVENT_LABELS).map((k) => (
            <div className="field" key={k}>
              <label>{EVENT_LABELS[k]}</label>
              <select value={prefs[k] || 'both'} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.value })}>
                <option value="off">Off</option>
                <option value="inapp">In-app</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </select>
            </div>
          ))}
        </div>
        <h2>Change Password</h2>
        <div className="form-row">
          <div className="field"><label>Current Password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
          <div className="field"><label>New Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <div className="buttons"><button className="btn" type="submit">Save Changes</button></div>
      </form>
    </div>
  );
}
