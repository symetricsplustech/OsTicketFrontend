import { useState, useEffect } from 'react';
import { BookOpen, Plus, Play, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@shared/lib/api';

interface Playbook {
  _id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  estimatedMinutes: number;
  useCount: number;
  lastUsedAt: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    assignedRole: string;
    estimatedMinutes: number;
    checklist: string[];
  }>;
}

export default function IncidentPlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Playbook | null>(null);
  const [form, setForm] = useState<any>({ name: '', category: 'network', severity: 'medium', steps: [] as any[] });

  useEffect(() => { loadPlaybooks(); }, []);

  const loadPlaybooks = async () => {
    try { const { data } = await api.get('/platform/playbooks'); setPlaybooks(data); } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/platform/playbooks', form); setShowForm(false); setForm({ name: '', category: 'network', severity: 'medium', steps: [] }); loadPlaybooks(); } catch {}
  };

  const handleUse = async (id: string) => {
    try { await api.post(`/platform/playbooks/${id}/use`); loadPlaybooks(); } catch {}
  };

  const addStep = () => {
    setForm({ ...form, steps: [...form.steps, { order: form.steps.length + 1, title: '', description: '', assignedRole: '', estimatedMinutes: 5, checklist: [] }] });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const steps = [...form.steps];
    steps[index] = { ...steps[index], [field]: value };
    setForm({ ...form, steps });
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Incident Playbooks</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Playbook
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Playbook Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="network">Network</option><option value="server">Server</option><option value="application">Application</option><option value="database">Database</option><option value="security">Security</option><option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <input type="number" placeholder="Est. Minutes" value={form.estimatedMinutes || 0} onChange={e => setForm({ ...form, estimatedMinutes: +e.target.value })} className="border rounded-lg px-3 py-2" min={0} />
          </div>
          <textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-3 py-2 w-full h-20" />

          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Steps ({form.steps.length})</h4>
              <button type="button" onClick={addStep} className="text-blue-600 text-sm hover:text-blue-800">+ Add Step</button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step: any, i: number) => (
                <div key={i} className="border rounded p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Step Title" value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} className="border rounded px-2 py-1 text-sm" />
                    <input placeholder="Assigned Role" value={step.assignedRole} onChange={e => updateStep(i, 'assignedRole', e.target.value)} className="border rounded px-2 py-1 text-sm" />
                  </div>
                  <textarea placeholder="Description" value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} className="border rounded px-2 py-1 text-sm w-full h-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4">
        {playbooks.map(pb => (
          <div key={pb._id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(pb)}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{pb.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${severityColor(pb.severity)}`}>{pb.severity}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pb.description || 'No description'}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">{pb.category}</span>
              <span>{pb.steps?.length || 0} steps</span>
              <span>~{pb.estimatedMinutes || 0}min</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Used {pb.useCount}x</span>
              <button onClick={(e) => { e.stopPropagation(); handleUse(pb._id); }} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded flex items-center gap-1">
                <Play className="h-3 w-3" /> Use
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-gray-600 mb-4">{selected.description}</p>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${severityColor(selected.severity)}`}>{selected.severity}</span>
              <span className="px-2 py-1 bg-gray-100 text-xs rounded">{selected.category}</span>
              <span className="text-sm text-gray-500">~{selected.estimatedMinutes}min</span>
            </div>
            <h3 className="font-semibold mb-2">Steps</h3>
            <div className="space-y-3">
              {selected.steps?.sort((a, b) => a.order - b.order).map((step, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{step.order}</span>
                    <span className="font-medium">{step.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-8">{step.description}</p>
                  {step.assignedRole && <p className="text-xs text-gray-400 mt-1 ml-8">Assigned to: {step.assignedRole}</p>}
                  {step.checklist?.length > 0 && (
                    <div className="mt-2 ml-8 space-y-1">
                      {step.checklist.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <input type="checkbox" className="rounded" /> {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
