import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  event: string;
  status: string;
  conditions: unknown[];
  actions: unknown[];
}

const EVENTS = [
  'ticket.created', 'ticket.updated', 'ticket.assigned', 'ticket.resolved', 'ticket.closed',
  'ticket.overdue', 'ticket.merged', 'incident.created', 'problem.created', 'change.created',
];

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', event: 'ticket.created' });
  const [conditions, setConditions] = useState([{ field: '', operator: 'equals', value: '' }]);
  const [actionType, setActionType] = useState('assign');
  const [actionConfig, setActionConfig] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/enterprise/workflows');
      setWorkflows(res.data.workflows || []);
    } catch { setWorkflows([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/workflows', {
        ...form,
        conditions: conditions.filter(c => c.field),
        actions: [{ type: actionType, config: { value: actionConfig } }],
      });
      toast.success('Workflow created');
      setShowForm(false);
      setForm({ name: '', description: '', event: 'ticket.created' });
      setConditions([{ field: '', operator: 'equals', value: '' }]);
      setActionType('assign');
      setActionConfig('');
      load();
    } catch { toast.error('Failed to create workflow'); } finally { setSaving(false); }
  };

  const toggleStatus = async (wf: Workflow) => {
    try {
      await api.put(`/enterprise/workflows/${wf._id}`, { status: wf.status === 'active' ? 'inactive' : 'active' });
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.delete(`/enterprise/workflows/${id}`);
      toast.success('Workflow deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Create Workflow</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Workflow</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trigger Event *</label>
                <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="mt-1 input-field">
                  {EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
              {conditions.map((c, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Field (e.g. priority)" value={c.field} onChange={(e) => { const n = [...conditions]; n[idx].field = e.target.value; setConditions(n); }} className="flex-1 input-field" />
                  <select value={c.operator} onChange={(e) => { const n = [...conditions]; n[idx].operator = e.target.value; setConditions(n); }} className="w-36 input-field">
                    <option>equals</option><option>not equals</option><option>contains</option><option>greater than</option><option>less than</option>
                  </select>
                  <input type="text" placeholder="Value" value={c.value} onChange={(e) => { const n = [...conditions]; n[idx].value = e.target.value; setConditions(n); }} className="flex-1 input-field" />
                </div>
              ))}
              <button type="button" onClick={() => setConditions([...conditions, { field: '', operator: 'equals', value: '' }])} className="text-sm text-brand-600 hover:text-brand-700">+ Add condition</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="mt-1 input-field">
                  <option value="assign">Assign to</option>
                  <option value="set_priority">Set Priority</option>
                  <option value="set_status">Set Status</option>
                  <option value="send_email">Send Email</option>
                  <option value="add_tag">Add Tag</option>
                  <option value="notify">Notify</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Action Value</label>
                <input type="text" value={actionConfig} onChange={(e) => setActionConfig(e.target.value)} className="mt-1 input-field" placeholder="e.g. agent@company.com" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Workflow'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-12 text-center text-gray-500">Loading...</div> :
          workflows.length === 0 ? <div className="col-span-3 py-12 text-center text-gray-500">No workflows yet</div> :
          workflows.map((wf) => (
            <div key={wf._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Link to={`/workflows/${wf._id}`} className="font-semibold text-gray-900 hover:text-brand-600">{wf.name}</Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(wf)} className={`px-2 py-1 text-xs rounded-full ${wf.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{wf.status}</button>
                  <button onClick={() => handleDelete(wf._id)} className="text-gray-400 hover:text-red-500 text-xs">Delete</button>
                </div>
              </div>
              {wf.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{wf.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Trigger: {wf.event}</span>
                <span>{wf.conditions?.length || 0} conditions, {wf.actions?.length || 0} actions</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
