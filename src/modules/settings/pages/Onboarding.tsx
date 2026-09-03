import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import toast from 'react-hot-toast';
import { CheckCircle, Building2, UserCheck, Users, Ticket, ArrowRight, ArrowLeft, PartyPopper, Plus, Trash2 } from 'lucide-react';

type Step = 'overview' | 'company' | 'team' | 'departments' | 'customers' | 'tickets';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company Profile', icon: <Building2 className="h-5 w-5" /> },
  { id: 'team', label: 'Create Your Team', icon: <UserCheck className="h-5 w-5" /> },
  { id: 'departments', label: 'Set Up Departments', icon: <Users className="h-5 w-5" /> },
  { id: 'customers', label: 'Add Customers', icon: <Users className="h-5 w-5" /> },
  { id: 'tickets', label: 'Ticket Settings', icon: <Ticket className="h-5 w-5" /> },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshModules } = useAuth();
  // Leave setup with a fresh module list so sidebar guards pass at once.
  const finishOnboarding = () => {
    refreshModules().catch(() => {}).finally(() => navigate('/tickets'));
  };
  const [currentStep, setCurrentStep] = useState<Step>('overview');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [company, setCompany] = useState({ name: '', email: '', phone: '', domain: '' });
  const [existingAgents, setExistingAgents] = useState<any[]>([]);
  const [agents, setAgents] = useState<{ name: string; email: string; password: string; isAdmin: boolean }[]>([]);
  const [existingDepts, setExistingDepts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ name: string; email: string }[]>([]);
  const [existingUsers, setExistingUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<{ name: string; email: string; password: string }[]>([]);
  const [ticketSettings, setTicketSettings] = useState({ autoAssign: true, maxOpenTickets: 50 });

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Company
        try {
          const companyRes = await api.get('/admin/company');
          const payload = companyRes.data;
          const c = payload.data || payload.company || payload;
          setCompany({ name: c.name || '', email: c.email || '', phone: c.phone || '', domain: c.domain || '' });
        } catch {}

        // Agents
        try {
          const agentsRes = await api.get('/admin/agents');
          setExistingAgents(agentsRes.data.items || []);
        } catch {}

        // Departments
        try {
          const deptsRes = await api.get('/admin/departments');
          setExistingDepts(deptsRes.data.items || []);
        } catch {}

        // Users
        try {
          const usersRes = await api.get('/admin/users');
          setExistingUsers(usersRes.data.items || []);
        } catch {}

        // Settings
        try {
          const settingsRes = await api.get('/admin/settings');
          const s = settingsRes.data.settings || settingsRes.data;
          if (s && (s.autoAssignNewTickets !== undefined || s.maxOpenTickets !== undefined)) {
            setTicketSettings({
              autoAssign: s.autoAssignNewTickets !== undefined ? s.autoAssignNewTickets : true,
              maxOpenTickets: s.maxOpenTickets || 50,
            });
          }
        } catch {}
      } catch {
        // ignore
      } finally {
        setLoadingData(false);
      }
    };
    loadAll();
  }, []);

  const completedCount = completedSteps.size;
  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  const goToStep = (step: Step) => setCurrentStep(step);

  const goBack = () => setCurrentStep('overview');

  const markComplete = (step: Step) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    setCurrentStep('overview');
    toast.success(`${STEPS.find(s => s.id === step)?.label} completed!`);
  };

  const saveCompany = async () => {
    setSaving(true);
    try {
      await api.put('/admin/company', company);
      markComplete('company');
    } catch { toast.error('Failed to save company'); } finally { setSaving(false); }
  };

  const saveAgents = async () => {
    setSaving(true);
    try {
      const valid = agents.filter(a => a.name && a.email && a.password);
      for (const a of valid) {
        await api.post('/admin/agents', {
          ...a, isActive: true,
          permissions: a.isAdmin ? ['admin.manage', 'access.manage', 'tickets.manage', 'users.manage'] : ['tickets.view'],
        });
      }
      markComplete('team');
    } catch { toast.error('Failed to create agents'); } finally { setSaving(false); }
  };

  const saveDepartments = async () => {
    setSaving(true);
    try {
      const valid = departments.filter(d => d.name);
      for (const d of valid) {
        await api.post('/admin/departments', { name: d.name, email: d.email, isActive: true });
      }
      markComplete('departments');
    } catch { toast.error('Failed to create departments'); } finally { setSaving(false); }
  };

  const saveCustomers = async () => {
    setSaving(true);
    try {
      const valid = customers.filter(c => c.name && c.email && c.password);
      for (const c of valid) {
        await api.post('/admin/users', { ...c, status: 'active' });
      }
      markComplete('customers');
    } catch { toast.error('Failed to create customers'); } finally { setSaving(false); }
  };

  const saveTicketSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { section: 'tickets', values: ticketSettings });
      markComplete('tickets');
    } catch { toast.error('Failed to save ticket settings'); } finally { setSaving(false); }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // ─── OVERVIEW ───
  if (currentStep === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Helpdesk</h1>
            <p className="text-gray-500">Let's get your helpdesk up and running. Complete each step below.</p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Setup Progress</span>
              <span className="text-sm text-gray-500">{completedCount}/{STEPS.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(completedCount / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const done = completedSteps.has(step.id);
              let detail = '';
              if (step.id === 'company' && company.name) detail = company.name;
              if (step.id === 'team' && existingAgents.length > 0) detail = `${existingAgents.length} agent(s)`;
              if (step.id === 'departments' && existingDepts.length > 0) detail = `${existingDepts.length} department(s)`;
              if (step.id === 'customers' && existingUsers.length > 0) detail = `${existingUsers.length} customer(s)`;

              return (
                <button key={step.id} onClick={() => goToStep(step.id)}
                  className={`w-full bg-white rounded-xl border p-5 flex items-center gap-4 transition-all hover:shadow-md ${done ? 'border-green-200 bg-green-50' : 'hover:border-brand-300'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                    {done ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{step.label}</span>
                      {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>}
                    </div>
                    <p className="text-sm text-gray-500">{detail || `Step ${i + 1} of ${STEPS.length}`}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>

          {completedCount === STEPS.length ? (
            <div className="text-center space-y-4">
              <PartyPopper className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-lg font-medium text-gray-900">You're all set!</p>
              <button onClick={finishOnboarding}
                className="px-8 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700">
                Go to Tickets
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button onClick={finishOnboarding}
                className="text-sm text-gray-500 hover:text-gray-700 underline">
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── STEP FORMS ───
  const renderStepForm = () => {
    switch (currentStep) {
      case 'company':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" required value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm" placeholder="Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm" placeholder="info@acme.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm" placeholder="+1 555 0100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input type="text" value={company.domain} onChange={e => setCompany({ ...company, domain: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm" placeholder="acme.com" />
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            {existingAgents.length > 0 && (
              <p className="text-sm text-gray-500">{existingAgents.length} agent(s) already exist. Add more below.</p>
            )}
            {agents.map((agent, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Agent {i + 1}</span>
                  {agents.length > 1 && (
                    <button onClick={() => setAgents(agents.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Name *" value={agent.name} onChange={e => {
                    const next = [...agents]; next[i] = { ...next[i], name: e.target.value }; setAgents(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" />
                  <input type="email" placeholder="Email *" value={agent.email} onChange={e => {
                    const next = [...agents]; next[i] = { ...next[i], email: e.target.value }; setAgents(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="password" placeholder="Password *" value={agent.password} onChange={e => {
                    const next = [...agents]; next[i] = { ...next[i], password: e.target.value }; setAgents(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" minLength={8} />
                  <label className="flex items-center gap-2 cursor-pointer px-3">
                    <input type="checkbox" checked={agent.isAdmin} onChange={e => {
                      const next = [...agents]; next[i] = { ...next[i], isAdmin: e.target.checked }; setAgents(next);
                    }} className="rounded text-brand-600" />
                    <span className="text-sm text-gray-700">Admin</span>
                  </label>
                </div>
              </div>
            ))}
            <button onClick={() => setAgents([...agents, { name: '', email: '', password: '', isAdmin: false }])}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus className="h-4 w-4" /> Add Another Agent
            </button>
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-4">
            {existingDepts.length > 0 && (
              <p className="text-sm text-gray-500">{existingDepts.length} department(s) already exist. Add more below.</p>
            )}
            <p className="text-sm text-gray-500">Create departments to organize your support team (e.g., Sales, Technical Support, Billing).</p>
            {departments.map((dept, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <input type="text" placeholder="Department name *" value={dept.name} onChange={e => {
                  const next = [...departments]; next[i] = { ...next[i], name: e.target.value }; setDepartments(next);
                }} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <input type="email" placeholder="Email (optional)" value={dept.email} onChange={e => {
                  const next = [...departments]; next[i] = { ...next[i], email: e.target.value }; setDepartments(next);
                }} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                {departments.length > 1 && (
                  <button onClick={() => setDepartments(departments.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setDepartments([...departments, { name: '', email: '' }])}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus className="h-4 w-4" /> Add Another Department
            </button>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-4">
            {existingUsers.length > 0 && (
              <p className="text-sm text-gray-500">{existingUsers.length} customer(s) already exist. Add more below.</p>
            )}
            <p className="text-sm text-gray-500">Create customer accounts. Customers can submit tickets and track their requests.</p>
            {customers.map((cust, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Customer {i + 1}</span>
                  {customers.length > 1 && (
                    <button onClick={() => setCustomers(customers.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="Name *" value={cust.name} onChange={e => {
                    const next = [...customers]; next[i] = { ...next[i], name: e.target.value }; setCustomers(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" />
                  <input type="email" placeholder="Email *" value={cust.email} onChange={e => {
                    const next = [...customers]; next[i] = { ...next[i], email: e.target.value }; setCustomers(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" />
                  <input type="password" placeholder="Password *" value={cust.password} onChange={e => {
                    const next = [...customers]; next[i] = { ...next[i], password: e.target.value }; setCustomers(next);
                  }} className="border rounded-lg px-3 py-2 text-sm" minLength={6} />
                </div>
              </div>
            ))}
            <button onClick={() => setCustomers([...customers, { name: '', email: '', password: '' }])}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus className="h-4 w-4" /> Add Another Customer
            </button>
          </div>
        );

      case 'tickets':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Configure how tickets are handled in your helpdesk.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-lg p-4">
                <input type="checkbox" checked={ticketSettings.autoAssign}
                  onChange={e => setTicketSettings({ ...ticketSettings, autoAssign: e.target.checked })}
                  className="rounded text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Auto-assign new tickets</p>
                  <p className="text-xs text-gray-500">Automatically distribute new tickets to available agents</p>
                </div>
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Max open tickets per agent</label>
                <input type="number" value={ticketSettings.maxOpenTickets}
                  onChange={e => setTicketSettings({ ...ticketSettings, maxOpenTickets: parseInt(e.target.value) || 50 })}
                  className="w-32 border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepData = STEPS.find(s => s.id === currentStep)!;
  const done = completedSteps.has(currentStep);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 hover:bg-white rounded-lg border">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-green-100 text-green-600' : 'bg-brand-100 text-brand-600'}`}>
                {done ? <CheckCircle className="h-4 w-4" /> : stepData.icon}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{stepData.label}</h1>
              {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>}
            </div>
            <p className="text-sm text-gray-500 mt-1">Step {stepIndex + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => goToStep(s.id)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                completedSteps.has(s.id) ? 'bg-green-500' : i === stepIndex ? 'bg-brand-600' : 'bg-gray-200'
              }`} />
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border p-6">
          {renderStepForm()}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button onClick={goBack} className="px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Back
          </button>
          <div className="flex gap-3">
            <button onClick={finishOnboarding} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 underline">
              Skip for now
            </button>
            <button onClick={
              currentStep === 'company' ? saveCompany :
              currentStep === 'team' ? saveAgents :
              currentStep === 'departments' ? saveDepartments :
              currentStep === 'customers' ? saveCustomers :
              saveTicketSettings
            } disabled={saving}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Saving...' : done ? 'Save Changes' : 'Complete Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
