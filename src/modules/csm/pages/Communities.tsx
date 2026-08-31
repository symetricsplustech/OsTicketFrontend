import { useGetCommunityThreadsQuery, useAddCommunityThreadMutation, useAnswerThreadMutation, useAcceptAnswerMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Users2, Plus, Send, CheckCircle, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface Answer {
  body: string;
  author?: string;
  votes?: number;
  accepted?: boolean;
}

interface Thread {
  _id: string;
  title: string;
  body: string;
  status?: string;
  answers?: Answer[];
  answersCount?: number;
}

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  answered: 'bg-blue-100 text-blue-700',
  accepted: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function Communities() {
  const { data: threads = [], refetch } = useGetCommunityThreadsQuery();
  const [addThread] = useAddCommunityThreadMutation();
  const [answerThread] = useAnswerThreadMutation();
  const [acceptAnswer] = useAcceptAnswerMutation();

  const [form, setForm] = useState({ title: '', body: '' });
  const [openId, setOpenId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [formErr, setFormErr] = useState('');
  const [actErr, setActErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submitThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setMsg('');
    try {
      await addThread(form).unwrap();
      setForm({ title: '', body: '' });
      setMsg('Thread posted.');
      refetch();
    } catch (err: any) {
      setFormErr(err?.data?.error || err?.data?.message || 'Failed to post thread.');
    }
  };

  const submitAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setActErr('');
    setMsg('');
    setBusy(true);
    try {
      await answerThread({ id, body: answerText.trim() }).unwrap();
      setAnswerText('');
      setMsg('Answer posted.');
      refetch();
    } catch (err: any) {
      setActErr(err?.data?.error || err?.data?.message || 'Failed to post answer.');
    } finally {
      setBusy(false);
    }
  };

  const accept = async (id: string, idx: number) => {
    setActErr('');
    setMsg('');
    setBusy(true);
    try {
      await acceptAnswer({ id, idx }).unwrap();
      setMsg('Answer accepted.');
      refetch();
    } catch (err: any) {
      setActErr(err?.data?.error || err?.data?.message || 'Failed to accept answer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
      </div>

      <form onSubmit={submitThread} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-gray-900">Start a Thread</h2>
        <input
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
        <textarea
          rows={3}
          placeholder="What do you want to discuss?"
          required
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className={inputCls}
        />
        {formErr && <p className="text-sm text-red-600">{formErr}</p>}
        {msg && !formErr && <p className="text-sm text-green-600">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Post Thread
        </button>
      </form>

      {threads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <XCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No community threads yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t: Thread) => {
            const answers = t.answers ?? [];
            const count = answers.length || t.answersCount || 0;
            const isOpen = openId === t._id;
            return (
              <div key={t._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setOpenId(isOpen ? null : t._id)} className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{t.body}</p>
                  </button>
                  <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full capitalize ${STATUS_BADGE[t.status || ''] || 'bg-gray-100 text-gray-700'}`}>
                    {t.status || 'open'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{count} answer(s)</span>
                  <button onClick={() => setOpenId(isOpen ? null : t._id)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    {isOpen ? 'Hide' : 'View answers'}
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    {answers.length === 0 ? (
                      <p className="text-xs text-gray-400">No answers yet.</p>
                    ) : (
                      answers.map((a, idx) => (
                        <div key={idx} className={`rounded-lg border p-3 ${a.accepted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50/50'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-800 flex-1">{a.body}</p>
                            {a.accepted ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 shrink-0">
                                <CheckCircle className="h-4 w-4" /> Accepted
                              </span>
                            ) : (
                              <button
                                onClick={() => accept(t._id, idx)}
                                disabled={busy}
                                className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                              >
                                Accept
                              </button>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            {a.author && <span>{a.author}</span>}
                            <span>{a.votes ?? 0} vote(s)</span>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex gap-2">
                      <input
                        placeholder="Write an answer…"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className={inputCls}
                      />
                      <button
                        onClick={() => submitAnswer(t._id)}
                        disabled={busy || !answerText.trim()}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50 shrink-0"
                      >
                        <Send className="h-4 w-4" /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actErr && <p className="text-sm text-red-600">{actErr}</p>}
    </div>
  );
}
