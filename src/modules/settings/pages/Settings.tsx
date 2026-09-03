import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { Building2, Users, Ticket, Bell, Mail, Shield, Settings as SettingsIcon, Key, ChevronRight } from 'lucide-react';

const SETTINGS_SECTIONS = [
  { id: 'company', label: 'Company Profile', description: 'Company name, logo, contact details', icon: Building2, path: '/settings' },
  { id: 'users', label: 'Users & Agents', description: 'Manage agents and customer accounts', icon: Users, path: '/settings/users' },
  { id: 'departments', label: 'Departments', description: 'Organize your team into departments', icon: Building2, path: '/settings/departments' },
  { id: 'teams', label: 'Teams', description: 'Create teams for collaboration', icon: Users, path: '/settings/teams' },
  { id: 'roles', label: 'Roles & Permissions', description: 'Define roles and access levels', icon: Shield, path: '/settings/roles' },
  { id: 'tickets', label: 'Ticket Settings', description: 'Statuses, priorities, SLAs, auto-assignment', icon: Ticket, path: '/settings' },
  { id: 'email', label: 'Email Settings', description: 'Email templates and notifications', icon: Mail, path: '/settings/email' },
  { id: 'notifications', label: 'Notifications', description: 'Configure notification preferences', icon: Bell, path: '/settings/notifications' },
  { id: 'access', label: 'Access Control', description: 'SSO, LDAP, and authentication', icon: Key, path: '/settings/access' },
];

export default function Settings() {
  const location = useLocation();
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [company, setCompany] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('company');

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, companyRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/company'),
        ]);
        setSettings(settingsRes.data.settings || settingsRes.data);
        setCompany(companyRes.data.company || companyRes.data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      await api.put('/admin/company', company);
      toast.success('Company profile saved');
    } catch {
      toast.error('Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { section: 'general', values: settings });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border p-4 sticky top-6">
          <h2 className="font-semibold text-gray-900 mb-3 px-3">Settings</h2>
          <nav className="space-y-1">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.id} to={section.path}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{section.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {activeSection === 'company' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" value={(company.name as string) || ''} onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={(company.email as string) || ''} onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" value={(company.phone as string) || ''} onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Support inbox (customers mail THIS address to create tickets)</label>
                <input type="email" placeholder="support@your-company.com" value={((company as any).supportEmail as string) || ''} onChange={(e) => setCompany({ ...company, supportEmail: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-gray-400 mt-1">Inbound routing matches To/Cc against this, then company email, then domain.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input type="text" value={(company.domain as string) || ''} onChange={(e) => setCompany({ ...company, domain: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="pt-2">
                <button onClick={handleSaveCompany} disabled={saving}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === 'tickets' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Settings</h1>
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={!!settings.autoAssignNewTickets}
                  onChange={(e) => setSettings({ ...settings, autoAssignNewTickets: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600" />
                <label className="text-sm text-gray-700">Auto-assign new tickets to agents</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={!!settings.allowPublicTickets}
                  onChange={(e) => setSettings({ ...settings, allowPublicTickets: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600" />
                <label className="text-sm text-gray-700">Allow public ticket submission</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Open Tickets per Agent</label>
                  <input type="number" value={(settings.maxOpenTickets as number) || 50}
                    onChange={(e) => setSettings({ ...settings, maxOpenTickets: parseInt(e.target.value) })}
                    className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Ticket Status</label>
                  <select value={(settings.defaultTicketStatus as string) || 'open'}
                    onChange={(e) => setSettings({ ...settings, defaultTicketStatus: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handleSaveSettings} disabled={saving}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Ticket Settings'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === 'users' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/users" className="text-brand-600 hover:underline">User Management</Link> page to manage agents and customers.</p>
          </div>
        )}

        {activeSection === 'departments' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/departments" className="text-brand-600 hover:underline">Departments</Link> page to manage departments.</p>
          </div>
        )}

        {activeSection === 'teams' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/teams" className="text-brand-600 hover:underline">Teams</Link> page to manage teams.</p>
          </div>
        )}

        {activeSection === 'roles' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/roles" className="text-brand-600 hover:underline">Roles & Permissions</Link> page to manage roles.</p>
          </div>
        )}

        {activeSection === 'email' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/email" className="text-brand-600 hover:underline">Email Settings</Link> page to configure email.</p>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/notifications" className="text-brand-600 hover:underline">Notifications</Link> page to configure notifications.</p>
          </div>
        )}

        {activeSection === 'access' && (
          <div className="text-center py-12 text-gray-500">
            <p>Use the <Link to="/settings/access" className="text-brand-600 hover:underline">Access Control</Link> page to configure SSO/LDAP.</p>
          </div>
        )}
      </div>
    </div>
  );
}
