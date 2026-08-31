import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  });
  const [files, setFiles] = useState<File[]>([]);

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
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea required rows={6} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Describe your issue in detail..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {(priorities.length ? priorities.map((priority) => priority.name) : ['Low', 'Normal', 'High', 'Emergency']).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
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
