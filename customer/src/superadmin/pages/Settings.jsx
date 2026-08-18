import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: '', role: '', allowedIps: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    api.get('/superadmin/settings')
      .then(({ data }) => setSettings(data.data))
      .catch((err) => setError(err.message));
    if (user) setProfile({ name: user.name || '', role: user.role || '', allowedIps: (user.allowedIps || []).join(', ') });
  }, [user]);

  const saveSettings = async () => {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/superadmin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.put('/superadmin/auth/me', {
        name: profile.name,
        role: profile.role,
        allowedIps: profile.allowedIps.split(',').map((s) => s.trim()).filter(Boolean),
      });
      localStorage.setItem('ost_superadmin_user', JSON.stringify(data.user));
      setProfile({ name: data.user.name, role: data.user.role, allowedIps: (data.user.allowedIps || []).join(', ') });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.put('/superadmin/auth/password', password);
      setPassword({ currentPassword: '', newPassword: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (path, value) => {
    const keys = path.split('.');
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let t = next;
      for (let i = 0; i < keys.length - 1; i++) t = t[keys[i]];
      t[keys[keys.length - 1]] = value;
      return next;
    });
  };

  if (error) return <div className="alert error">{error}</div>;
  if (!settings) return <div className="box muted">Loading…</div>;

  return (
    <>
      <h1>Platform Settings</h1>
      {saved && <div className="alert success">Settings saved successfully.</div>}

      <div className="grid-2">
        <div className="box">
          <div className="box-header"><h1>Company</h1></div>
          <div className="field">
            <label>Platform Name</label>
            <input type="text" value={settings.company?.name || ''} onChange={(e) => set('company.name', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Email</label>
              <input type="email" value={settings.company?.email || ''} onChange={(e) => set('company.email', e.target.value)} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="text" value={settings.company?.phone || ''} onChange={(e) => set('company.phone', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>URL</label>
            <input type="text" value={settings.company?.url || ''} onChange={(e) => set('company.url', e.target.value)} />
          </div>
          <div className="buttons">
            <button className="btn" onClick={saveSettings} disabled={busy}>{busy ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </div>

        <div className="box">
          <div className="box-header"><h1>Ticket Defaults</h1></div>
          <div className="field">
            <label>Default Priority</label>
            <select value={settings.system?.defaultPriority || 'Normal'} onChange={(e) => set('system.defaultPriority', e.target.value)}>
              <option>Low</option><option>Normal</option><option>High</option><option>Emergency</option>
            </select>
          </div>
          <div className="field">
            <label>Date Format</label>
            <input type="text" value={settings.system?.dateFormat || ''} onChange={(e) => set('system.dateFormat', e.target.value)} />
          </div>
          <div className="field">
            <label>Time Format</label>
            <select value={settings.system?.timeFormat || '24h'} onChange={(e) => set('system.timeFormat', e.target.value)}>
              <option value="24h">24 Hour</option>
              <option value="12h">12 Hour</option>
            </select>
          </div>
          <div className="field">
            <label>Max Open Tickets (0 = unlimited)</label>
            <input type="number" min="0" value={settings.system?.maxOpenTickets || 0} onChange={(e) => set('system.maxOpenTickets', Number(e.target.value))} />
          </div>
          <div className="buttons">
            <button className="btn" onClick={saveSettings} disabled={busy}>{busy ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="box">
          <div className="box-header"><h1>My Profile</h1></div>
          <form onSubmit={updateProfile}>
            <div className="field">
              <label>Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })}>
                <option value="super_admin">Super Admin</option>
                <option value="support">Platform Support</option>
              </select>
            </div>
            <div className="field">
              <label>Allowed IPs (comma separated, empty = allow all)</label>
              <input type="text" value={profile.allowedIps} onChange={(e) => setProfile({ ...profile, allowedIps: e.target.value })} />
            </div>
            <div className="buttons">
              <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Update Profile'}</button>
            </div>
          </form>
        </div>

        <div className="box">
          <div className="box-header"><h1>Change Password</h1></div>
          <form onSubmit={changePassword}>
            <div className="field">
              <label>Current Password</label>
              <input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required />
            </div>
            <div className="field">
              <label>New Password</label>
              <input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div className="buttons">
              <button type="submit" className="btn" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
