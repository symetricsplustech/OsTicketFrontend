import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { Wrench, Calendar, Clock, CheckCircle } from 'lucide-react';

interface WorkOrder {
  _id: string;
  number: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  scheduledDate?: string;
  scheduledEnd?: string;
  assignedTo?: { name: string };
  customer?: { name: string };
  location?: { address: string };
  tasks: Array<{ title: string; completed: boolean }>;
  totalCost: number;
  createdAt: string;
}

const TYPES = ['installation', 'repair', 'maintenance', 'inspection', 'consultation', 'other'];
const STATUSES = ['draft', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled'];

export default function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'repair', priority: 'medium', scheduledDate: '', scheduledEnd: '', locationAddress: '' });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/field-service', { params });
      setWorkOrders(res.data.workOrders || []);
    } catch { setWorkOrders([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/field-service', { ...form, location: { address: form.locationAddress } });
      toast.success('Work order created');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'repair', priority: 'medium', scheduledDate: '', scheduledEnd: '', locationAddress: '' });
      load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleStart = async (id: string) => {
    try { await api.put(`/field-service/${id}/start`); toast.success('Started'); load(); } catch { toast.error('Failed'); }
  };

  const handleComplete = async (id: string) => {
    try { await api.put(`/field-service/${id}/complete`); toast.success('Completed'); load(); } catch { toast.error('Failed'); }
  };

  const statusColor = (s: string) => s === 'completed' ? 'bg-green-100 text-green-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-700' : s === 'scheduled' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';
  const priorityColor = (p: string) => p === 'urgent' || p === 'high' ? 'text-red-600' : p === 'medium' ? 'text-yellow-600' : 'text-gray-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'list' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>List</button>
          <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'calendar' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Calendar</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">New Work Order</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Work Order</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Title *</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 input-field">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 input-field"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Scheduled Start</label><input type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Scheduled End</label><input type="datetime-local" value={form.scheduledEnd} onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Location</label><input type="text" value={form.locationAddress} onChange={(e) => setForm({ ...form, locationAddress: e.target.value })} className="mt-1 input-field" placeholder="Customer address" /></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Search work orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md input-field" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40"><option value="">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
      </div>

      {view === 'list' ? (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
                workOrders.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No work orders</td></tr> :
                workOrders.map((wo) => {
                  const completedTasks = wo.tasks?.filter(t => t.completed).length || 0;
                  return (
                    <tr key={wo._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="text-sm font-medium">{wo.number}</p><p className="text-xs text-gray-500">{wo.title}</p></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{wo.type}</span></td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColor(wo.status)}`}>{wo.status.replace('_', ' ')}</span></td>
                      <td className="px-6 py-4 text-sm"><span className={priorityColor(wo.priority)}>{wo.priority}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{wo.assignedTo?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {wo.status === 'scheduled' && <button onClick={() => handleStart(wo._id)} className="text-xs text-blue-600 hover:text-blue-700">Start</button>}
                          {wo.status === 'in_progress' && <button onClick={() => handleComplete(wo._id)} className="text-xs text-green-600 hover:text-green-700">Complete</button>}
                          {wo.tasks && <span className="text-xs text-gray-400">{completedTasks}/{wo.tasks.length}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 text-center">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayWOs = workOrders.filter(wo => wo.scheduledDate && wo.scheduledDate.startsWith(dateStr));
              return (
                <div key={i} className="bg-white p-2 min-h-[80px]">
                  <p className="text-xs text-gray-400 mb-1">{date.getDate()}</p>
                  {dayWOs.map(wo => (
                    <div key={wo._id} className={`text-xs px-1 py-0.5 rounded mb-0.5 ${wo.status === 'completed' ? 'bg-green-100 text-green-700' : wo.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {wo.number}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
