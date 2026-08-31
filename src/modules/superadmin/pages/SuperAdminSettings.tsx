import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/superadmin/settings');
      setSettings(res.data?.data || {});
    } catch { /* toast */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await api.put('/superadmin/settings', settings);
      setMsg('Settings saved successfully');
    } catch { setMsg('Failed to save settings'); }
    setSaving(false);
  };

  const update = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-10 text-center text-sm text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Global Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide configuration for the SaaS control plane</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-2 rounded-lg text-sm ${msg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>
      )}

      <div className="bg-white rounded-xl border divide-y">
        <div className="p-5">
          <h3 className="font-semibold mb-3">Platform Branding</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input value={settings.platformName || ''} onChange={e => update('platformName', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Unified Platform" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input value={settings.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="support@example.com" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold mb-3">Security Policies</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input type="number" value={settings.sessionTimeout || 60} onChange={e => update('sessionTimeout', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input type="number" value={settings.maxLoginAttempts || 5} onChange={e => update('maxLoginAttempts', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Min Length</label>
              <input type="number" value={settings.passwordMinLength || 8} onChange={e => update('passwordMinLength', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Require 2FA for Admins</label>
              <select value={settings.require2faForAdmins ? 'true' : 'false'} onChange={e => update('require2faForAdmins', e.target.value === 'true')} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold mb-3">Impersonation Policy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Impersonation Duration (hours)</label>
              <input type="number" value={settings.impersonationMaxHours || 4} onChange={e => update('impersonationMaxHours', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Require Approval for Impersonation</label>
              <select value={settings.impersonationRequiresApproval ? 'true' : 'false'} onChange={e => update('impersonationRequiresApproval', e.target.value === 'true')} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold mb-3">Tenant Defaults</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Trial Days</label>
              <input type="number" value={settings.defaultTrialDays || 14} onChange={e => update('defaultTrialDays', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Grace Period (days)</label>
              <input type="number" value={settings.defaultGracePeriodDays || 7} onChange={e => update('defaultGracePeriodDays', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
