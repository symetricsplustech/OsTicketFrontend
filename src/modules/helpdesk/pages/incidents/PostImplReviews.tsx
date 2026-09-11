import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, XCircle, Save } from 'lucide-react';

interface PirQuestion {
  question: string;
  answer: string;
  category: string;
}

interface PIR {
  _id: string;
  change?: { _id: string; title: string };
  plannedDate?: string;
  questions?: PirQuestion[];
  lessonsLearned?: string;
  outcome?: string;
  riskRating?: string;
  status?: string;
  completedDate?: string;
}

interface ChangeRow {
  _id: string;
  title: string;
}

const CATEGORIES = ['timeline', 'communication', 'technical', 'process'];
const OUTCOMES = ['successful', 'partially_successful', 'unsuccessful'];
const RISK_RATINGS = ['low', 'medium', 'high'];

const OUTCOME_BADGES: Record<string, string> = {
  successful: 'bg-green-100 text-green-700',
  partially_successful: 'bg-yellow-100 text-yellow-700',
  unsuccessful: 'bg-red-100 text-red-700',
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const emptyQuestion = (): PirQuestion => ({ question: '', answer: '', category: 'timeline' });

const emptyForm = () => ({
  changeId: '',
  plannedDate: '',
  questions: [emptyQuestion()],
  lessonsLearned: '',
  outcome: 'successful',
  riskRating: 'low',
});

export default function PostImplReviews() {
  const [pirs, setPirs] = useState<PIR[]>([]);
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/extra/pir');
        const data = res.data;
        setPirs((Array.isArray(data) ? data : data?.rows || data?.pirs || []) as PIR[]);
      } catch {
        setPirs([]);
      }
      try {
        const res = await api.get('/enterprise/changes');
        const data = res.data;
        setChanges((Array.isArray(data) ? data : data?.changes || []) as ChangeRow[]);
      } catch {
        setChanges([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (pir: PIR) => {
    setEditingId(pir._id);
    setForm({
      changeId: pir.change?._id || '',
      plannedDate: pir.plannedDate ? pir.plannedDate.slice(0, 10) : '',
      questions:
        pir.questions && pir.questions.length > 0
          ? pir.questions.map((q) => ({
              question: q.question || '',
              answer: q.answer || '',
              category: q.category || 'timeline',
            }))
          : [emptyQuestion()],
      lessonsLearned: pir.lessonsLearned || '',
      outcome: pir.outcome || 'successful',
      riskRating: pir.riskRating || 'low',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateQuestion = (idx: number, patch: Partial<PirQuestion>) => {
    setForm({
      ...form,
      questions: form.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        changeId: form.changeId,
        plannedDate: form.plannedDate,
        questions: form.questions,
        lessonsLearned: form.lessonsLearned,
        outcome: form.outcome,
        riskRating: form.riskRating,
      };
      if (editingId) {
        await api.put(`/extra/pir/${editingId}`, payload);
      } else {
        await api.post('/extra/pir', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      const res = await api.get('/extra/pir');
      const data = res.data;
      setPirs((Array.isArray(data) ? data : data?.rows || data?.pirs || []) as PIR[]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-blue-600" />
          Post-Implementation Reviews
        </h1>
        {!showForm && (
          <button onClick={openCreate} className="btn-primary">New PIR</button>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit PIR' : 'New Post-Implementation Review'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Linked Change *</label>
                <select
                  required
                  value={form.changeId}
                  onChange={(e) => setForm({ ...form, changeId: e.target.value })}
                  className="mt-1 input-field"
                >
                  <option value="">Select a change…</option>
                  {changes.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Planned Date</label>
                <input
                  type="date"
                  value={form.plannedDate}
                  onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                  className="mt-1 input-field"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Review Questions</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()] })}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Add Question
                </button>
              </div>
              <div className="space-y-3">
                {form.questions.map((q, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Question ${idx + 1}`}
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                        className="flex-1 input-field"
                      />
                      <select
                        value={q.category}
                        onChange={(e) => updateQuestion(idx, { category: e.target.value })}
                        className="input-field w-44"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) })}
                        disabled={form.questions.length === 1}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Answer / findings"
                      value={q.answer}
                      onChange={(e) => updateQuestion(idx, { answer: e.target.value })}
                      className="w-full input-field"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lessons Learned</label>
              <textarea
                rows={3}
                value={form.lessonsLearned}
                onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })}
                className="mt-1 input-field"
                placeholder="What went well, what could be improved…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Outcome</label>
                <select
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  className="mt-1 input-field"
                >
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>{o.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Rating</label>
                <select
                  value={form.riskRating}
                  onChange={(e) => setForm({ ...form, riskRating: e.target.value })}
                  className="mt-1 input-field"
                >
                  {RISK_RATINGS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : editingId ? 'Update PIR' : 'Save PIR'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm());
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="card px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading reviews…</p>
      ) : pirs.length === 0 ? (
        <p className="card px-6 py-12 text-center text-sm text-gray-500">No post-implementation reviews yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pirs.map((p) => (
            <div key={p._id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {p.change?.title || 'Unlinked change'}
                </h3>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full capitalize ${OUTCOME_BADGES[p.outcome || ''] || 'bg-gray-100 text-gray-700'}`}>
                  {(p.outcome || 'pending').replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
                  Risk: {p.riskRating || '—'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{p.status || 'unknown'}</span>
              </div>
              <div className="text-xs text-gray-500">
                Completed: {fmtDate(p.completedDate)}
              </div>
              {p.status === 'pending' && (
                <button
                  onClick={() => openEdit(p)}
                  className="btn-secondary w-full mt-auto"
                >
                  Edit Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
