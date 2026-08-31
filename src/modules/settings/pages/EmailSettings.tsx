import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body?: string;
  trigger: string;
  recipient: string;
}

export default function EmailSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '', trigger: 'ticket.created', recipient: 'agent' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/email-templates');
      setTemplates(res.data.templates || []);
    } catch { setTemplates([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/email-templates/${editing._id}`, form);
        toast.success('Template updated');
      } else {
        await api.post('/admin/email-templates', form);
        toast.success('Template created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', subject: '', body: '', trigger: 'ticket.created', recipient: 'agent' });
      load();
    } catch { toast.error('Failed to save template'); } finally { setSaving(false); }
  };

  const handleEdit = (t: EmailTemplate) => {
    setEditing(t);
    setForm({ name: t.name, subject: t.subject, body: t.body || '', trigger: t.trigger, recipient: t.recipient });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/admin/email-templates/${id}`);
      toast.success('Template deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', subject: '', body: '', trigger: 'ticket.created', recipient: 'agent' }); }} className="btn-primary">Add Template</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Template' : 'New Template'}</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trigger</label>
                <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="mt-1 input-field">
                  <option value="ticket.created">Ticket Created</option>
                  <option value="ticket.assigned">Ticket Assigned</option>
                  <option value="ticket.resolved">Ticket Resolved</option>
                  <option value="ticket.closed">Ticket Closed</option>
                  <option value="sla.breach">SLA Breach</option>
                  <option value="survey.sent">Survey Sent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient</label>
                <select value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="mt-1 input-field">
                  <option value="agent">Agent</option>
                  <option value="customer">Customer</option>
                  <option value="both">Both</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body (HTML supported)</label>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} className="mt-1 input-field font-mono text-sm" placeholder="<h1>Ticket #{{number}}</h1><p>Hello {{name}},</p>" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Template' : 'Create Template'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              templates.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No templates yet</td></tr> :
              templates.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{t.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.subject}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{t.trigger}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.recipient}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(t)} className="text-xs text-brand-600 hover:text-brand-700">Edit</button>
                      <button onClick={() => handleDelete(t._id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
