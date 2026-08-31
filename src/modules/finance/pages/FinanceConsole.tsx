import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { Calculator, Plus, CheckCircle, XCircle } from 'lucide-react';

const CASE_TYPES = ['invoice_exception', 'billing_dispute', 'payment_inquiry', 'ar_collection', 'credit_note', 'write_off', 'journal_request', 'intercompany', 'treasury', 'close_task'];

interface FinanceCase {
  _id: string;
  title: string;
  caseType?: string;
  amount?: number;
  reasonCode?: string;
  status?: string;
}

interface CloseTask {
  _id: string;
  task: string;
  status?: string;
}

type Tab = 'cases' | 'close';

export default function FinanceConsole() {
  const [tab, setTab] = useState<Tab>('cases');
  const [typeFilter, setTypeFilter] = useState('');
  const [cases, setCases] = useState<FinanceCase[]>([]);
  const [caseForm, setCaseForm] = useState({ title: '', caseType: CASE_TYPES[0], amount: 0, reasonCode: '' });
  const [period, setPeriod] = useState('2026-08');
  const [tasks, setTasks] = useState<CloseTask[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => { if (tab === 'cases') loadCases(); }, [typeFilter, tab]);

  const loadCases = async () => {
    try { const { data } = await api.get('/em/finance/cases?type=' + typeFilter); setCases(data); } catch {}
  };

  const loadTasks = async () => {
    try { const { data } = await api.get('/em/finance/close-tasks?period=' + period); setTasks(data); } catch {}
  };

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/finance/cases', caseForm);
      setCaseForm({ title: '', caseType: CASE_TYPES[0], amount: 0, reasonCode: '' });
      loadCases();
    } catch {}
  };

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    try { await api.post(`/em/finance/cases/${id}/decide`, { decision, resolveNow: true }); loadCases(); } catch {}
  };

  const completeTask = async (taskId: string) => {
    try { await api.post(`/em/finance/close/${period}/complete-task/${taskId}`, {}); loadTasks(); } catch {}
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/finance/close-tasks', { period, task: newTask });
      setNewTask('');
      loadTasks();
    } catch {}
  };

  const doneCount = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const statusBadge = (status?: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'approved' || status === 'resolved' || status === 'done' ? 'bg-green-100 text-green-700'
      : status === 'rejected' ? 'bg-red-100 text-red-700'
      : status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700'
      : 'bg-blue-100 text-blue-700'
    }`}>{(status || 'open').replace(/_/g, ' ')}</span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6" /> Finance Console</h1>

      <div className="flex gap-2 border-b">
        {(['cases', 'close'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{t === 'close' ? 'Close Calendar' : t}</button>
        ))}
      </div>

      {tab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="">All Types</option>
              {CASE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <form onSubmit={createCase} className="bg-white p-4 rounded-lg border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Title" value={caseForm.title} onChange={e => setCaseForm({ ...caseForm, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <select value={caseForm.caseType} onChange={e => setCaseForm({ ...caseForm, caseType: e.target.value })} className="border rounded-lg px-3 py-2">
                {CASE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <input type="number" min={0} step="0.01" placeholder="Amount" value={caseForm.amount} onChange={e => setCaseForm({ ...caseForm, amount: +e.target.value })} className="border rounded-lg px-3 py-2" />
              <input placeholder="Reason Code" value={caseForm.reasonCode} onChange={e => setCaseForm({ ...caseForm, reasonCode: e.target.value })} className="border rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Create Case</button>
          </form>

          <div className="space-y-3">
            {cases.map(c => (
              <div key={c._id} className="bg-white p-4 rounded-lg border flex items-start justify-between">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(c.caseType || '').replace(/_/g, ' ')} · ${(c.amount || 0).toLocaleString()}
                    {c.reasonCode && ` · ${c.reasonCode}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(c.status)}
                  {(c.status === 'pending_approval' || c.status === 'open') && (
                    <>
                      <button onClick={() => decide(c._id, 'approved')} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><CheckCircle className="h-4 w-4" /> Approve</button>
                      <button onClick={() => decide(c._id, 'rejected')} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"><XCircle className="h-4 w-4" /> Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'close' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input placeholder="Period (e.g. 2026-08)" value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-3 py-2" />
            <button onClick={loadTasks} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Load</button>
          </div>

          {tasks.length > 0 && (
            <div className="bg-white p-4 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-gray-500">{doneCount}/{tasks.length} done ({progress}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <form onSubmit={addTask} className="flex gap-2">
            <input placeholder="Add close task…" value={newTask} onChange={e => setNewTask(e.target.value)} className="border rounded-lg px-3 py-2 flex-1" required />
            <button type="submit" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Task</button>
          </form>

          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t._id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className={`font-medium ${t.status === 'done' || t.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{t.task}</p>
                  {statusBadge(t.status)}
                </div>
                {t.status !== 'done' && t.status !== 'completed' && (
                  <button onClick={() => completeTask(t._id)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><CheckCircle className="h-4 w-4" /> Done</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
