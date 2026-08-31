import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import toast from 'react-hot-toast';

const ALL_MODULES = [
  { key: 'helpdesk', label: 'Help Desk', desc: 'Ticketing, SLA, knowledge base' },
  { key: 'crm', label: 'CRM', desc: 'Leads, accounts, pipeline' },
  { key: 'csm', label: 'Customer Success', desc: 'Health scores, playbooks' },
  { key: 'itam', label: 'IT Asset Mgmt', desc: 'Hardware/software inventory' },
  { key: 'itom', label: 'IT Operations', desc: 'Incidents, monitoring, status pages' },
  { key: 'projects', label: 'Projects', desc: 'Tasks, milestones, resource tracking' },
  { key: 'hr', label: 'HR', desc: 'Leave, claims, employees' },
  { key: 'field-service', label: 'Field Service', desc: 'Dispatch, checklists, mobile' },
  { key: 'workflow', label: 'Workflow', desc: 'Automation rules' },
  { key: 'analytics', label: 'Analytics', desc: 'Reports and dashboards' },
  { key: 'ai', label: 'AI', desc: 'Suggest replies, sentiment, triage' },
  { key: 'settings', label: 'Settings', desc: 'System configuration' },
];

export default function ModuleSelector() {
  const [selected, setSelected] = useState<string[]>(['helpdesk', 'settings']);
  const [loading, setLoading] = useState(false);
  const { refreshModules } = useAuth();
  const navigate = useNavigate();

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleActivate = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await api.post('/auth/modules', { modules: selected });
      await refreshModules();
      toast.success('Modules activated!');
      navigate('/');
    } catch {
      toast.error('Failed to activate modules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Modules</h1>
        <p className="text-gray-600 mb-8">Select the features you need. You can add more later.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ALL_MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected.includes(m.key)
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm">{m.label}</h3>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected.includes(m.key) ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                }`}>
                  {selected.includes(m.key) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{selected.length} modules selected</p>
          <button onClick={handleActivate} disabled={loading || selected.length === 0}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Activating...' : 'Activate & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
