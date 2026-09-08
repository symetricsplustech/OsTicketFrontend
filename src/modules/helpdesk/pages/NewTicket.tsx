import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface HelpTopic {
  _id: string;
  topic: string;
  name?: string;
}

interface Priority {
  _id: string;
  name: string;
  priority: number;
}

export default function NewTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [form, setForm] = useState({
    subject: '',
    details: '',
    topic: '',
    priority: 'Normal',
    impact: '',
    urgency: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [triaging, setTriaging] = useState(false);
  const [triage, setTriage] = useState<any>(null);

  const runTriage = async () => {
    if (!form.subject.trim() && !form.details.trim()) {
      toast.error('Describe the issue first');
      return;
    }
    setTriaging(true);
    try {
      const res = await api.post('/agent/tickets/suggest', { subject: form.subject, details: form.details });
      setTriage(res.data);
    } catch {
      toast.error('Suggestions unavailable');
    } finally {
      setTriaging(false);
    }
  };
  const [suggestions, setSuggestions] = useState<Array<{ _id: string; question: string; helpful?: number }>>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const q = `${form.subject} ${form.details}`.trim();
    if (q.length < 8) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/kb/suggest', { params: { q: q.slice(0, 200) } });
        setSuggestions(res.data.items || []);
      } catch { /* suggest is best-effort */ }
    }, 600);
    return () => clearTimeout(t);
  }, [form.subject, form.details]);

  useEffect(() => {
    const load = async () => {
      try {
        const topicsRes = await api.get('/tickets/open-form');
        setTopics(topicsRes.data.topics || []);
        setPriorities(topicsRes.data.priorities || []);
      } catch {
        // fallback
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('subject', form.subject.trim());
      payload.append('details', form.details.trim());
      payload.append('topic', form.topic);
      payload.append('priority', form.priority);
      if (form.impact) payload.append('impact', form.impact);
      if (form.urgency) payload.append('urgency', form.urgency);
      files.forEach((file) => payload.append('files', file));
      const res = await api.post('/tickets', payload);
      toast.success('Ticket created!');
      navigate(`/tickets/${res.data.ticket.number}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Open New Ticket</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {suggestions.length > 0 && !solved && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
            <p className="text-sm font-semibold text-gray-800">Suggested solutions — did one of these fix it?</p>
            <ul className="mt-2 space-y-1">
              {suggestions.map((s) => (
                <li key={s._id} className="text-sm">
                  <Link to={`/kb`} className="text-brand-700 hover:underline">{s.question}</Link>
                  {!!s.helpful && <span className="text-xs text-gray-400"> · {s.helpful} found helpful</span>}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setSolved(true)} className="mt-2 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Yes — no ticket needed</button>
          </div>
        )}
        {solved && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Glad the knowledge base helped! You can still submit below if the issue persists.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Help Topic</label>
          <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Select a topic</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.topic || t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Brief description of the issue" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <button type="button" onClick={runTriage} disabled={triaging}
              className="text-xs text-brand-600 hover:underline disabled:opacity-40">
              {triaging ? 'Analyzing…' : '✨ Suggest topic & priority'}
            </button>
          </div>
          <textarea required rows={6} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Describe your issue in detail..." />
          {triage && (
            <div className="mt-2 space-y-1.5 bg-brand-50/50 border border-brand-100 rounded-lg p-3">
              <p className="text-[11px] text-gray-500">Learned from {triage.trainedOn ?? 0} resolved tickets {!triage.learned && '(not enough history yet)'}</p>
              <div className="flex gap-1.5 flex-wrap">
                {(triage.topic || []).map((t: any) => (
                  <button type="button" key={t.id} onClick={() => setForm({ ...form, topic: t.id })}
                    className="text-xs px-2 py-1 bg-white border border-brand-200 rounded-full text-brand-700 hover:bg-brand-50">
                    {t.name} · {Math.round(t.score * 100)}%
                  </button>
                ))}
                {(triage.priority || []).map((p: any) => (
                  <button type="button" key={p.id} onClick={() => setForm({ ...form, priority: p.name })}
                    className="text-xs px-2 py-1 bg-white border border-orange-200 rounded-full text-orange-700 hover:bg-orange-50">
                    {p.name} · {Math.round(p.score * 100)}%
                  </button>
                ))}
              </div>
              {(triage.similar || []).length > 0 && (
                <p className="text-[11px] text-gray-500">
                  Similar: {triage.similar.slice(0, 3).map((s: any) => `#${s.number}`).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {(priorities.length ? priorities.map((priority) => priority.name) : ['Low', 'Normal', 'High', 'Emergency']).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">…or let the matrix decide from impact × urgency:</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Impact…</option>
              <option value="low">Low impact</option>
              <option value="medium">Medium impact</option>
              <option value="high">High impact</option>
            </select>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Urgency…</option>
              <option value="low">Low urgency</option>
              <option value="medium">Medium urgency</option>
              <option value="high">High urgency</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="mt-1 block w-full text-sm text-gray-600" />
          {files.length > 0 && <p className="mt-1 text-xs text-gray-500">{files.length} file(s) selected</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
