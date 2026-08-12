import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/index.js';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', signature: '', currentPassword: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, signature: user.signature || '' }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/auth/agent/me', form);
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
