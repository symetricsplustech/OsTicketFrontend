import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDateTime, formatRelativeTime } from '@shared/lib/format';
import toast from 'react-hot-toast';
import { Paperclip, Send, UserCircle, Download, Trash2, ArrowRightLeft, Link2, GitMerge, SplitSquareHorizontal } from 'lucide-react';

interface Ticket {
  _id: string;
  number: string;
  title: string;
  body?: string;
  status: string;
  priority: string;
  category?: string;
  source?: string;
  assignedTo?: { _id: string; name: string; email: string };
  createdBy: { name: string; email: string };
  departmentId?: { name: string };
  slaPlan?: { name: string };
  firstResponseDue?: string;
  resolutionDue?: string;
  thread: Array<{
    _id: string;
    type: string;
    content: string;
    author?: { name: string; email: string };
    attachments?: string[];
    createdAt: string;
  }>;
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Agent { _id: string; name: string; email: string; }
interface Department { _id: string; name: string; }
interface TicketStatus { key: string; name: string; isClosed?: boolean; }
interface AssetOption { _id: string; name: string; serial?: string; hostname?: string; }

const normaliseTicket = (payload: any): Ticket => {
  const ticket = payload.ticket || payload;
  const threads = payload.threads || ticket.thread || [];
  return {
    ...ticket,
    title: ticket.subject || ticket.title || '',
    body: ticket.customData?.details || ticket.body || '',
    assignedTo: ticket.agent || ticket.assignedTo,
    createdBy: ticket.user || ticket.createdBy || { name: '', email: '' },
    departmentId: ticket.dept || ticket.departmentId,
    slaPlan: ticket.sla || ticket.slaPlan,
    resolutionDue: ticket.dueDate || ticket.resolutionDue,
    thread: threads.map((entry: any) => ({
      ...entry,
      content: entry.body || entry.content || entry.systemMessage || '',
      author: entry.agent || entry.user || entry.author,
      attachments: (entry.attachments || []).map((attachment: any) => attachment.path || attachment.filename || attachment),
    })),
  };
};

function RelatedKnowledge({ subject }: { subject: string }) {
  const [items, setItems] = useState<Array<{ _id: string; question: string; helpful?: number }>>([]);
  useEffect(() => {
    if (!subject || subject.trim().length < 4) return;
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/agent/kb/suggest', { params: { q: subject.slice(0, 200) } });
        setItems(res.data.items || []);
      } catch { /* best-effort */ }
    }, 500);
    return () => clearTimeout(t);
  }, [subject]);
  const vote = async (id: string, helpful: boolean) => {
    try {
      await api.post(`/kb/faqs/${id}/vote`, { helpful });
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, helpful: (i.helpful || 0) + (helpful ? 1 : 0) } : i)));
    } catch { /* best-effort */ }
  };
  if (!items.length) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-sm mb-3">Related knowledge</h3>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a._id} className="text-sm">
            <div className="text-gray-800">{a.question}</div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => vote(a._id, true)} className="text-xs text-green-600 hover:underline">Helpful{a.helpful ? ` (${a.helpful})` : ''}</button>
              <button onClick={() => vote(a._id, false)} className="text-xs text-gray-400 hover:underline">Not helpful</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TicketDetail() {  const { number } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyType, setReplyType] = useState<'reply' | 'note'>('reply');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tasks, setTasks] = useState<Array<{ _id?: string; id?: string; title: string; status?: string }>>([]);
  const [newTask, setNewTask] = useState('');
  const [closureCodes, setClosureCodes] = useState<{ resolutionCodes: string[]; closureCodes: string[] }>({ resolutionCodes: [], closureCodes: [] });
  const [resolutionCode, setResolutionCode] = useState('');
  const [closureCode, setClosureCode] = useState('');
  const [slaPaused, setSlaPaused] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);

  const runSummary = async () => {
    if (!ticket) return;
    setSummarizing(true);
    try {
      const res = await api.post('/agent/assist/summarize', { ticketNumber: ticket.number });
      setSummary(res.data);
    } catch {
      toast.error('Summarization failed');
    } finally {
      setSummarizing(false);
    }
  };
  const [slaHistory, setSlaHistory] = useState<any[]>([]);
  const [actionMode, setActionMode] = useState<'asset' | 'merge' | 'split' | null>(null);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [splitSubject, setSplitSubject] = useState('');
  const [splitThreadIds, setSplitThreadIds] = useState<string[]>([]);
  const [actionSaving, setActionSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketRes, agentsRes, deptsRes] = await Promise.all([
          api.get(`/agent/tickets/${number}`),
          api.get('/admin/agents').catch(() => ({ data: { agents: [] } })),
          api.get('/admin/departments').catch(() => ({ data: { departments: [] } })),
        ]);
        setTicket(normaliseTicket(ticketRes.data));
        setAgents(ticketRes.data.agents || agentsRes.data.items || agentsRes.data.agents || []);
        setDepartments(ticketRes.data.depts || deptsRes.data.departments || []);
        setStatuses(ticketRes.data.statuses || []);
        const t = normaliseTicket(ticketRes.data) as any;
        if (Array.isArray(t.tasks)) setTasks(t.tasks);
        api.get('/gaps2/closure-codes').then((r) => setClosureCodes(r.data)).catch(() => {});
        api.get(`/agent/tickets/${number}/sla-history`).then((r) => setSlaHistory(r.data?.data?.events || [])).catch(() => {});
      } catch { /* fallback */ } finally { setLoading(false); }
    };
    load();
  }, [number]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setReplying(true);
    try {
      const formData = new FormData();
      formData.append('message', replyType === 'reply' ? reply : note);
      selectedFiles.forEach(f => formData.append('files', f));

      // @mention extraction — creates Mention records + notifications for matched agents
      if (reply.includes('@')) {
        api.post('/ops/mentions/extract', {
          text: reply,
          entityType: replyType === 'note' ? 'note' : 'ticket',
          entityId: ticket._id || ticket.number,
        }).catch(() => {});
      }

      if (replyType === 'note') {
        await api.post(`/agent/tickets/${ticket.number}/note`, { message: note });
      } else {
        await api.post(`/agent/tickets/${ticket.number}/reply`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(replyType === 'note' ? 'Note added' : 'Reply sent');
      setReply('');
      setNote('');
      setSelectedFiles([]);
      const res = await api.get(`/agent/tickets/${number}`);
      setTicket(normaliseTicket(res.data));
    } catch { toast.error('Failed to send'); } finally { setReplying(false); }
  };

  // Live co-editing presence: heartbeat + viewer list
  const [viewers, setViewers] = useState<Array<{ name: string; lastSeen: string }>>([]);
  useEffect(() => {
    if (!number) return;
    const beat = () => {
      api.post(`/ops/tickets/${number}/presence`).catch(() => {});
      api.get(`/ops/tickets/${number}/presence`)
        .then(r => setViewers(r.data.viewers || []))
        .catch(() => {});
    };
    beat();
    const iv = setInterval(beat, 30000);
    return () => clearInterval(iv);
  }, [number]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      let resolution: Record<string, string> | undefined;
      if (newStatus === 'resolved') {
        const code = window.prompt('Resolution code (e.g. fixed / workaround / wont-fix):', 'fixed');
        if (!code) return;
        const solution = window.prompt('Solution summary (required):', '');
        if (!solution?.trim()) { toast.error('Solution is required to resolve'); return; }
        resolution = { code: code.trim(), solution: solution.trim() };
      }
      await api.post(`/agent/tickets/${ticket.number}/status`, { status: newStatus, ...(resolution ? { resolution } : {}) });
      setTicket({ ...ticket, status: newStatus });
      toast.success('Status updated');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update status'); }
  };

  const handleAssign = async () => {
    if (!ticket || !selectedAgent) return;
    try {
      await api.post(`/agent/tickets/${ticket.number}/assign`, { agentId: selectedAgent });
      const agent = agents.find(a => a._id === selectedAgent);
      setTicket({ ...ticket, assignedTo: agent ? { _id: agent._id, name: agent.name, email: agent.email } : ticket.assignedTo });
      toast.success('Ticket assigned');
    } catch { toast.error('Failed to assign'); }
  };

  const handleTransferDept = async () => {
    if (!ticket || !selectedDept) return;
    try {
      await api.post(`/agent/tickets/${ticket.number}/transfer`, { deptId: selectedDept });
      const dept = departments.find(d => d._id === selectedDept);
      setTicket({ ...ticket, departmentId: dept ? { name: dept.name } : ticket.departmentId });
      setSelectedDept('');
      toast.success('Ticket transferred');
    } catch { toast.error('Failed to transfer'); }
  };

  const handleAddTask = async () => {
    if (!ticket || !newTask.trim()) return;
    try {
      const res = await api.post(`/agent/tickets/${ticket.number}/tasks`, { title: newTask.trim(), status: 'open' });
      setTasks((ts) => [...ts, res.data.task || res.data || { title: newTask.trim(), status: 'open' }]);
      setNewTask('');
      toast.success('Task added');
    } catch { toast.error('Failed to add task'); }
  };

  const handleToggleTask = async (task: any) => {
    if (!ticket) return;
    const id = task._id || task.id;
    const next = task.status === 'done' ? 'open' : 'done';
    try {
      if (id) await api.put(`/agent/tickets/${ticket.number}/tasks/${id}`, { status: next });
      setTasks((ts) => ts.map((t) => (t === task ? { ...t, status: next } : t)));
    } catch { toast.error('Failed to update task'); }
  };

  const handleSla = async (action: 'pause' | 'resume') => {
    if (!ticket) return;
    try {
      await api.post(`/agent/tickets/${ticket.number}/sla/${action}`, {});
      setSlaPaused(action === 'pause');
      toast.success(`SLA ${action}d`);
    } catch { toast.error(`Failed to ${action} SLA`); }
  };

  const handleClosure = async () => {
    if (!ticket || !resolutionCode || !closureCode) return toast.error('Pick resolution + closure codes');
    try {
      await api.put(`/gaps2/tickets/${ticket.number}/closure`, { resolutionCode, closureCode });
      toast.success('Closure codes saved');
    } catch { toast.error('Failed to save closure codes'); }
  };

  const openAssetAction = async () => {
    setActionMode('asset');
    if (assets.length) return;
    try {
      const res = await api.get('/enterprise/assets');
      setAssets(res.data.assets || []);
    } catch { toast.error('Failed to load assets'); }
  };

  const handleLinkAsset = async () => {
    if (!ticket || !selectedAsset) return;
    setActionSaving(true);
    try {
      await api.post(`/agent/tickets/${ticket.number}/fields`, { asset: selectedAsset });
      toast.success('Asset linked');
      setActionMode(null);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to link asset'); }
    finally { setActionSaving(false); }
  };

  const handleMerge = async () => {
    if (!ticket || !mergeTarget.trim()) return;
    setActionSaving(true);
    try {
      const target = mergeTarget.trim().toUpperCase();
      await api.post(`/agent/tickets/${ticket.number}/merge`, { targetNumber: target });
      toast.success(`Merged into ${target}`);
      navigate(`/tickets/${target}`);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to merge tickets'); }
    finally { setActionSaving(false); }
  };

  const toggleSplitThread = (id: string) => {
    setSplitThreadIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const handleSplit = async () => {
    if (!ticket || !splitSubject.trim() || !splitThreadIds.length) return;
    setActionSaving(true);
    try {
      const res = await api.post(`/agent/tickets/${ticket.number}/split`, { subject: splitSubject.trim(), threadIds: splitThreadIds });
      const created = res.data.ticket;
      toast.success(`Created ${created.number}`);
      navigate(`/tickets/${created.number}`);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to split ticket'); }
    finally { setActionSaving(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const removeFile = (idx: number) => setSelectedFiles(files => files.filter((_, i) => i !== idx));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!ticket) return <div className="text-center py-12 text-gray-500">Ticket not found</div>;

  const thread = ticket.thread || [];
  const availableStatuses = statuses.reduce<TicketStatus[]>(
    (items, status) => (items.some((item) => item.key === status.key) ? items : [...items, status]),
    ['open', 'assigned', 'overdue', 'resolved', 'closed', 'archived'].map((key) => ({ key, name: key })),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/tickets')} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Tickets</button>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">#{ticket.number} — {ticket.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {viewers.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg" title={`Also viewing: ${viewers.map(v => v.name).join(', ')}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-700 font-medium">
                {viewers.length} other{viewers.length > 1 ? 's' : ''} viewing
              </span>
              <span className="hidden md:inline text-xs text-green-600 max-w-[160px] truncate">
                ({viewers.map(v => v.name).join(', ')})
              </span>
            </div>
          )}
          <button onClick={runSummary} disabled={summarizing}
            className="text-xs px-3 py-2 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-50 disabled:opacity-40">
            {summarizing ? 'Summarizing…' : '✨ Summarize'}
          </button>
          <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} className="input-field w-40">
            {availableStatuses.map((status) => <option key={status.key} value={status.key}>{status.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Thread */}
          <div className="space-y-4">
            {thread.map((entry) => (
              <div key={entry._id} className={`card p-5 ${entry.type === 'note' ? 'border-l-4 border-yellow-400 bg-yellow-50/30' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {actionMode === 'split' && entry.type !== 'note' && (
                      <input aria-label={`Select message from ${entry.author?.name || 'System'}`} type="checkbox" checked={splitThreadIds.includes(entry._id)} onChange={() => toggleSplitThread(entry._id)} />
                    )}
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">{entry.author?.name || 'System'}</span>
                    {entry.type === 'note' && <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Internal Note</span>}
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(entry.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.attachments.map((att, i) => (
                      <a key={i} href={att} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200">
                        <Download className="h-3 w-3" /> {att.split('/').pop()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {summary && (
            <div className="card p-5 border-brand-200 bg-brand-50/40">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm">Thread summary</h3>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-white border text-gray-500">
                  {summary.provider === 'llm' ? 'LLM' : 'on-device extractive'}
                </span>
                <button onClick={() => setSummary(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">dismiss</button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.summary || 'Nothing substantial yet.'}</p>
              <p className="text-xs text-gray-400 mt-2">
                {summary.counts?.messages ?? 0} entries · voices: {(summary.participants || []).join(', ') || '—'}
              </p>
            </div>
          )}

          {/* Reply Form */}
          <div className="card p-5">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setReplyType('reply')} className={`text-sm font-medium pb-1 border-b-2 ${replyType === 'reply' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'}`}>Reply to Customer</button>
              <button onClick={() => setReplyType('note')} className={`text-sm font-medium pb-1 border-b-2 ${replyType === 'note' ? 'border-yellow-600 text-yellow-600' : 'border-transparent text-gray-500'}`}>Internal Note</button>
            </div>
            <form onSubmit={handleReply}>
              <textarea
                value={replyType === 'reply' ? reply : note}
                onChange={(e) => replyType === 'reply' ? setReply(e.target.value) : setNote(e.target.value)}
                rows={4}
                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 ${
                  replyType === 'reply' ? 'border-gray-300 focus:ring-brand-500' : 'border-yellow-300 focus:ring-yellow-500'
                }`}
                placeholder={replyType === 'reply' ? 'Type your reply to the customer...' : 'Add an internal note (not visible to customer)...'}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <Paperclip className="h-3 w-3" /> {f.name}
                      <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-3">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="submit" disabled={replying || !(replyType === 'reply' ? reply : note).trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                  <Send className="h-4 w-4" />{replying ? 'Sending...' : replyType === 'reply' ? 'Reply' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <RelatedKnowledge subject={(ticket as any).title || ''} />
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium">{ticket.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="font-medium">{ticket.priority}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Department</span><span className="font-medium">{ticket.departmentId?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Requester</span><span className="font-medium">{ticket.createdBy?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium">{formatDateTime(ticket.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Updated</span><span className="font-medium">{formatRelativeTime(ticket.updatedAt)}</span></div>
              {ticket.slaPlan && <div className="flex justify-between"><span className="text-gray-500">SLA</span><span className="font-medium">{ticket.slaPlan.name}</span></div>}
              {ticket.resolutionDue && <div className="flex justify-between"><span className="text-gray-500">Due</span><span className="font-medium text-orange-600">{formatDateTime(ticket.resolutionDue)}</span></div>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Quick Assign</h3>
            <div className="space-y-2">
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="input-field text-sm">
                <option value="">Select agent...</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
              <button onClick={handleAssign} disabled={!selectedAgent} className="w-full btn-primary text-sm">Assign</button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Actions</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="input-field text-sm flex-1">
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button onClick={handleTransferDept} disabled={!selectedDept} className="btn-secondary text-sm px-3">
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>
              <button onClick={openAssetAction} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center"><Link2 className="h-4 w-4" /> Link Asset</button>
              <button onClick={() => setActionMode(actionMode === 'merge' ? null : 'merge')} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center"><GitMerge className="h-4 w-4" /> Merge Tickets</button>
              <button onClick={() => { setActionMode(actionMode === 'split' ? null : 'split'); setSplitThreadIds([]); }} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center"><SplitSquareHorizontal className="h-4 w-4" /> Split Ticket</button>
              {actionMode === 'asset' && (
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Asset</label>
                  <select aria-label="Asset to link" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} className="input-field text-sm w-full">
                    <option value="">Select an asset…</option>
                    {assets.map((asset) => <option key={asset._id} value={asset._id}>{asset.serial ? `${asset.serial} · ` : ''}{asset.name}{asset.hostname ? ` · ${asset.hostname}` : ''}</option>)}
                  </select>
                  <div className="flex gap-2"><button onClick={handleLinkAsset} disabled={!selectedAsset || actionSaving} className="btn-primary text-xs flex-1">Link</button><button onClick={() => setActionMode(null)} className="btn-secondary text-xs">Cancel</button></div>
                </div>
              )}
              {actionMode === 'merge' && (
                <div className="rounded-lg border border-orange-200 bg-orange-50/40 p-3 space-y-2">
                  <p className="text-xs text-orange-800">This ticket will close and its conversation will move to the target.</p>
                  <input aria-label="Target ticket number" value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)} placeholder="Target ticket number" className="input-field text-sm w-full" />
                  <div className="flex gap-2"><button onClick={handleMerge} disabled={!mergeTarget.trim() || actionSaving} className="btn-primary text-xs flex-1">Merge</button><button onClick={() => setActionMode(null)} className="btn-secondary text-xs">Cancel</button></div>
                </div>
              )}
              {actionMode === 'split' && (
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <p className="text-xs text-gray-600">Select one or more customer messages in the conversation, then name the new ticket.</p>
                  <input aria-label="New split ticket subject" value={splitSubject} onChange={(e) => setSplitSubject(e.target.value)} placeholder="New ticket subject" className="input-field text-sm w-full" />
                  <div className="flex gap-2"><button onClick={handleSplit} disabled={!splitSubject.trim() || !splitThreadIds.length || actionSaving} className="btn-primary text-xs flex-1">Split {splitThreadIds.length || ''}</button><button onClick={() => setActionMode(null)} className="btn-secondary text-xs">Cancel</button></div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Tasks</h3>
            <div className="space-y-1.5 mb-2">
              {tasks.length === 0 && <p className="text-xs text-gray-400">No tasks yet.</p>}
              {tasks.map((t, i) => (
                <label key={t._id || t.id || i} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={t.status === 'done'} onChange={() => handleToggleTask(t)} className="rounded" />
                  <span className={t.status === 'done' ? 'line-through text-gray-400' : ''}>{t.title}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="New task…" className="input-field text-sm flex-1" />
              <button onClick={handleAddTask} className="btn-primary text-sm px-3">Add</button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">SLA {slaPaused && <span className="text-xs text-orange-600">(paused)</span>}</h3>
            <div className="flex gap-2">
              <button onClick={() => handleSla('pause')} disabled={slaPaused} className="btn-secondary text-sm flex-1 disabled:opacity-40">Pause</button>
              <button onClick={() => handleSla('resume')} disabled={!slaPaused} className="btn-secondary text-sm flex-1 disabled:opacity-40">Resume</button>
            </div>
            <div className="mt-4 space-y-2 border-t pt-3">
              {slaHistory.length === 0 && <p className="text-xs text-gray-400">No SLA history recorded yet.</p>}
              {slaHistory.map((event) => <div key={event._id} className="border-l-2 border-purple-200 pl-3 text-xs"><div className="font-medium capitalize">{event.clock?.replace(/_/g, ' ')} {event.event}</div><div className="text-gray-500">{formatDateTime(event.occurredAt)}{event.reason ? ` · ${event.reason}` : ''}</div></div>)}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Closure</h3>
            <div className="space-y-2">
              <select value={resolutionCode} onChange={(e) => setResolutionCode(e.target.value)} className="input-field text-sm w-full">
                <option value="">Resolution code…</option>
                {closureCodes.resolutionCodes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={closureCode} onChange={(e) => setClosureCode(e.target.value)} className="input-field text-sm w-full">
                <option value="">Closure code…</option>
                {closureCodes.closureCodes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={handleClosure} className="w-full btn-secondary text-sm">Save codes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
