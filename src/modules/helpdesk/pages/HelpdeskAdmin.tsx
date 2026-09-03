import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

// ITSM-19 — ITSM Administration: help topics, canned responses,
// announcements, closure codes and soft-deleted ticket trash/restore.
// Tenant-scoped; module settings live under Settings.
type Tab = 'topics' | 'canned' | 'announcements' | 'closure' | 'trash';

export default function HelpdeskAdmin() {
  const [tab, setTab] = useState<Tab>('topics');
  const [topics, setTopics] = useState<any[]>([]);
  const [canned, setCanned] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [codes, setCodes] = useState<any>(null);
  const [trash, setTrash] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({ topic: '', title: '', message: '', name: '' });

  const load = async (t: Tab) => {
    setLoading(true);
    try {
      if (t === 'topics') {
        const r = await api.get('/admin/help-topics').catch(() => ({ data: { topics: [] } }));
        setTopics(r.data.topics || r.data || []);
      } else if (t === 'canned') {
        const r = await api.get('/agent/canned').catch(() => ({ data: { canned: [] } }));
        setCanned(r.data.canned || r.data || []);
      } else if (t === 'announcements') {
        const r = await api.get('/agent/announcements').catch(() => ({ data: { announcements: [] } }));
        setAnnouncements(r.data.announcements || r.data || []);
      } else if (t === 'closure') {
        const r = await api.get('/gaps2/closure-codes').catch(() => ({ data: null }));
        setCodes(r.data);
      } else {
        const r = await api.get('/gaps2/tickets-trash').catch(() => ({ data: [] }));
        setTrash(Array.isArray(r.data) ? r.data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); setDraft({ topic: '', title: '', message: '', name: '' }); }, [tab]);

  const createTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/help-topics', { topic: draft.topic });
      toast.success('Help topic created');
      setDraft({ ...draft, topic: '' });
      load('topics');
    } catch { toast.error('Create failed'); }
  };

  const createCanned = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agent/canned', { title: draft.title, message: draft.message });
      toast.success('Canned response created');
      setDraft({ ...draft, title: '', message: '' });
      load('canned');
    } catch { toast.error('Create failed'); }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agent/announcements', { title: draft.title, message: draft.message });
      toast.success('Announcement published');
      setDraft({ ...draft, title: '', message: '' });
      load('announcements');
    } catch { toast.error('Create failed'); }
  };

  const restore = async (ticketNumber: string) => {
    try {
      await api.post(`/gaps2/tickets/${ticketNumber}/restore`, {});
      toast.success(`#${ticketNumber} restored`);
      load('trash');
    } catch { toast.error('Restore failed'); }
  };

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'topics', label: 'Help Topics' },
    { key: 'canned', label: 'Canned Responses' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'closure', label: 'Closure Codes' },
    { key: 'trash', label: 'Trash & Restore' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk Admin</h1>
          <p className="text-sm text-gray-500">Categories, templates, codes &amp; retention</p>
        </div>
        <Link to="/priority-matrix" className="btn-secondary text-sm">Priority Matrix</Link>
      </div>

      <div className="flex gap-2 text-sm flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg border ${tab === t.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="card p-10 text-center text-gray-400">Loading…</div> : (
        <>
          {tab === 'topics' && (
            <div className="card p-5 space-y-4">
              <form onSubmit={createTopic} className="flex gap-2">
                <input required value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                  placeholder="New help topic" className="input-field text-sm flex-1" />
                <button className="btn-primary text-sm">Add</button>
              </form>
              <ul className="divide-y text-sm">
                {topics.map((t: any) => <li key={t._id || t.topic} className="py-2">{t.topic || t.name}</li>)}
                {topics.length === 0 && <li className="py-4 text-gray-400 text-sm">No topics.</li>}
              </ul>
            </div>
          )}

          {tab === 'canned' && (
            <div className="card p-5 space-y-4">
              <form onSubmit={createCanned} className="grid gap-2">
                <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title *" className="input-field text-sm" />
                <textarea required value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  rows={2} placeholder="Message *" className="input-field text-sm" />
                <div><button className="btn-primary text-sm">Add canned response</button></div>
              </form>
              <ul className="divide-y text-sm">
                {canned.map((c: any) => (
                  <li key={c._id} className="py-2"><p className="font-medium">{c.title}</p><p className="text-gray-500 text-xs line-clamp-1">{c.message}</p></li>
                ))}
                {canned.length === 0 && <li className="py-4 text-gray-400 text-sm">No canned responses.</li>}
              </ul>
            </div>
          )}

          {tab === 'announcements' && (
            <div className="card p-5 space-y-4">
              <form onSubmit={createAnnouncement} className="grid gap-2">
                <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title *" className="input-field text-sm" />
                <textarea required value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  rows={2} placeholder="Message *" className="input-field text-sm" />
                <div><button className="btn-primary text-sm">Publish</button></div>
              </form>
              <ul className="divide-y text-sm">
                {announcements.map((a: any) => (
                  <li key={a._id} className="py-2"><p className="font-medium">{a.title}</p><p className="text-gray-500 text-xs">{a.message}</p></li>
                ))}
                {announcements.length === 0 && <li className="py-4 text-gray-400 text-sm">No announcements.</li>}
              </ul>
            </div>
          )}

          {tab === 'closure' && (
            <div className="card p-5">
              {codes ? (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Resolution codes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(codes.resolutionCodes || []).map((c: string) => <span key={c} className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">{c}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Closure codes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(codes.closureCodes || []).map((c: string) => <span key={c} className="px-2 py-1 bg-gray-50 border rounded text-xs">{c}</span>)}
                    </div>
                  </div>
                </div>
              ) : <p className="text-sm text-gray-400">Closure codes unavailable.</p>}
              <p className="text-xs text-gray-400 mt-4">Set per ticket via <span className="font-mono">PUT /gaps2/tickets/:number/closure</span> or the ticket detail screen.</p>
            </div>
          )}

          {tab === 'trash' && (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Deleted</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trash.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Trash is empty — soft-deleted tickets appear here, never hard-deleted.</td></tr>
                  ) : trash.map((t: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5 text-sm font-medium">#{t.ticketNumber}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-500">{t.reason || '—'}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-500">{t.deletedAt ? new Date(t.deletedAt).toLocaleString() : '—'}</td>
                      <td className="px-5 py-2.5"><button onClick={() => restore(t.ticketNumber)} className="text-xs text-green-600 hover:underline">Restore</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
