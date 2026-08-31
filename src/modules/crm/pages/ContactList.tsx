import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  account?: { _id: string; name: string };
  title?: string;
  createdAt: string;
}

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', title: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      const res = await api.get('/crm/contacts', { params });
      setContacts(res.data.contacts || []);
      setTotal(res.data.total || 0);
    } catch { setContacts([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/crm/contacts', form);
      toast.success('Contact created');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', title: '' });
      load();
    } catch { toast.error('Failed to create contact'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts {total > 0 && <span className="text-gray-400 text-lg font-normal">({total})</span>}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Contact</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Contact</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 input-field" placeholder="Job title" />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Contact'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-md input-field" />

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              contacts.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No contacts found</td></tr> :
              contacts.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.account?.name || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {total > 20 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="btn-secondary text-xs px-3 py-1">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
