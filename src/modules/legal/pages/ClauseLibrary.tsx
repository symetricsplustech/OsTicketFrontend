import { useGetClauseItemsQuery, useAddClauseItemMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Scale, Plus, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

const CATEGORIES = ['liability', 'termination', 'confidentiality', 'sla', 'payment', 'ip', 'data_protection', 'other'];

interface ClauseItem {
  _id: string;
  title: string;
  category: string;
  riskNotes?: string;
  body?: string;
  fallbackPosition?: string;
}

export default function ClauseLibrary() {
  const { data: clauses = [], isLoading, refetch } = useGetClauseItemsQuery();
  const [addClause] = useAddClauseItemMutation();

  const [form, setForm] = useState({ title: '', category: 'liability', body: '', fallbackPosition: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: (clauses as ClauseItem[]).filter((c) => (c.category || 'other') === cat),
  })).filter((g) => g.items.length > 0);
  const knownCats = new Set(CATEGORIES);
  const extras = Array.from(new Set((clauses as ClauseItem[]).map((c) => c.category || 'other').filter((c) => !knownCats.has(c))));
  extras.forEach((cat) =>
    grouped.push({ category: cat, items: (clauses as ClauseItem[]).filter((c) => (c.category || 'other') === cat) })
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      await addClause(form).unwrap();
      setForm({ title: '', category: 'liability', body: '', fallbackPosition: '' });
      setMsg('Clause added to library.');
      refetch();
    } catch (e2: any) {
      setErr(e2?.data?.error || e2?.data?.message || 'Failed to add clause.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Scale className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Clause Library</h1>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-gray-900">Add Clause</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              placeholder="Limitation of liability cap"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <textarea
            rows={4}
            required
            placeholder="Preferred clause language…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fallback Position</label>
          <input
            placeholder="Acceptable compromise if preferred position is rejected"
            value={form.fallbackPosition}
            onChange={(e) => setForm({ ...form, fallbackPosition: e.target.value })}
            className={inputCls}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {!err && msg && <p className="text-sm text-green-600">{msg}</p>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50">
          <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Add Clause'}
        </button>
      </form>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading clauses…</p>
      ) : clauses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <XCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Clause library is empty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.category}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{group.category.replace('_', ' ')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((c) => (
                  <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
                      <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700 capitalize">
                        {(c.category || 'other').replace('_', ' ')}
                      </span>
                    </div>
                    {c.body && <p className="text-xs text-gray-600 line-clamp-2">{c.body}</p>}
                    {c.riskNotes && <p className="text-xs italic text-gray-500">{c.riskNotes}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
