import React, { useState } from 'react';
import { api } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', currentPassword: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    if (form.password && form.password.length < 6) {
      setError('New password must be at least 6 characters');
      setBusy(false);
      return;
    }
    if (form.password && form.password !== form.confirm) {
      setError('New password and confirmation do not match');
      setBusy(false);
      return;
    }
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.currentPassword = form.currentPassword;
      if (form.password) payload.password = form.password;
      await api.put('/users/me', payload);
      await refresh();
      setSuccess('Profile updated successfully.');
      setForm((f) => ({ ...f, currentPassword: '', password: '', confirm: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="box" style={{ maxWidth: 640 }}>
      <div className="box-header"><h1>My Profile</h1></div>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field"><label>Name <span className="req">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={user?.email || ''} disabled />
          <span className="hint">Email cannot be changed from the portal.</span>
        </div>
        <h2 style={{ fontSize: 15, marginTop: 18 }}>Change Password</h2>
        <div className="form-row">
          <div className="field"><label>Current Password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
          <div className="field"><label>New Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="field"><label>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></div>
        </div>
        <div className="buttons">
          <button className="btn small" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
          <button className="btn small secondary" type="button" onClick={logout}>Sign Out</button>
        </div>
      </form>
    </div>
  );
}
