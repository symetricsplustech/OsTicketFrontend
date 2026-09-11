import { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import api from '@shared/lib/api';

interface Template { _id: string; name: string; subject: string; body: string; category: string; priority: string; }

export default function TicketTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', category: '', priority: 'medium' });

  useEffect(() => { load(); }, []);

  const load = async () => { try { const { data } = await api.get('/extra/templates'); setTemplates(data); } catch {} };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/extra/templates', form); setShowForm(false); setForm({ name: '', subject: '', body: '', category: '', priority: 'medium' }); load(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Ticket Templates</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> New Template</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Template Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border rounded-lg px-3 py-2" />
          </div>
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="border rounded-lg px-3 py-2 w-full" />
          <textarea placeholder="Body" value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="border rounded-lg px-3 py-2 w-full h-32" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t._id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
            <h3 className="font-semibold">{t.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.subject}</p>
            <p className="text-xs text-gray-400 mt-2 line-clamp-3">{t.body}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              {t.category && <span className="px-2 py-1 bg-gray-100 rounded">{t.category}</span>}
              <span className="px-2 py-1 bg-gray-100 rounded">{t.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
