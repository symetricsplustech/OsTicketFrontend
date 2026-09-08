import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Edit, Copy, Play, ChevronUp, ChevronDown, Bot, Zap, MessageCircle,
  HelpCircle, GitBranch, PhoneOff, StopCircle, Ticket, Search, ArrowRight, X,
} from 'lucide-react';

/* ── Types ── */
interface BotNode {
  id: string;
  label: string;
  type: 'start' | 'message' | 'question' | 'condition' | 'handoff' | 'end' | 'ticket_status' | 'kb_search';
  text: string;
  next: string;
  options: string;
  conditions: string;
}

interface BotFlow {
  _id: string;
  name: string;
  key: string;
  trigger: string;
  enabled: boolean;
  nodes: BotNode[];
  startNode: string;
}

const NODE_TYPES: { value: BotNode['type']; label: string; desc: string }[] = [
  { value: 'start',         label: 'Start',         desc: 'entry point' },
  { value: 'message',       label: 'Message',       desc: 'send a message then continue to next' },
  { value: 'question',      label: 'Question',      desc: 'ask user, branch by option' },
  { value: 'condition',     label: 'Condition',     desc: 'branch by keyword test' },
  { value: 'handoff',       label: 'Handoff',       desc: 'transfer to live agent' },
  { value: 'end',           label: 'End',           desc: 'terminal' },
  { value: 'ticket_status', label: 'Ticket Status', desc: 'look up the user\'s tickets and respond' },
  { value: 'kb_search',     label: 'KB Search',     desc: 'search knowledge base and respond' },
];

const NODE_ICONS: Record<BotNode['type'], React.ReactNode> = {
  start:         <Zap size={14} />,
  message:       <MessageCircle size={14} />,
  question:      <HelpCircle size={14} />,
  condition:     <GitBranch size={14} />,
  handoff:       <PhoneOff size={14} />,
  end:           <StopCircle size={14} />,
  ticket_status: <Ticket size={14} />,
  kb_search:     <Search size={14} />,
};

const emptyFlow = { name: '', key: '', trigger: '', enabled: true, nodes: [] as BotNode[], startNode: '' };

const makeNode = (type: BotNode['type'] = 'message'): BotNode => ({
  id: crypto.randomUUID(),
  label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
  type,
  text: '',
  next: '',
  options: '',
  conditions: '',
});

/* ── Component ── */
export default function BotDesigner() {
  const [flows, setFlows] = useState<BotFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyFlow);
  const [saving, setSaving] = useState(false);

  /* create / edit form */
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formTrigger, setFormTrigger] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  /* test panel */
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ matched: boolean; reply: string; nodeId?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  /* ── Load flows ── */
  const loadFlows = async () => {
    try {
      const res = await api.get('/admin/bot-flows');
      setFlows(res.data.flows || []);
    } catch { setFlows([]); } finally { setLoading(false); }
  };

  useEffect(() => { loadFlows(); }, []);

  /* ── Select flow for editing ── */
  const selectFlow = (f: BotFlow) => {
    setSelectedId(f._id);
    setDraft({
      name: f.name,
      key: f.key,
      trigger: f.trigger,
      enabled: f.enabled,
      nodes: (f.nodes || []).map(n => ({ ...n })),
      startNode: f.startNode || '',
    });
  };

  /* ── Create / update flow header ── */
  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startId = crypto.randomUUID();
      const startNode: BotNode = { id: startId, label: 'Start', type: 'start', text: '', next: '', options: '', conditions: '' };
      const payload = { name: formName, key: formKey, trigger: formTrigger, enabled: true, nodes: [startNode], startNode: startId };
      if (editingId) {
        await api.put(`/admin/bot-flows/${editingId}`, payload);
        toast.success('Flow updated');
      } else {
        await api.post('/admin/bot-flows', payload);
        toast.success('Flow created');
      }
      setShowForm(false);
      setFormName('');
      setFormKey('');
      setFormTrigger('');
      setEditingId(null);
      await loadFlows();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed');
    }
  };

  const deleteFlow = async (id: string) => {
    if (!confirm('Delete this flow?')) return;
    try {
      await api.delete(`/admin/bot-flows/${id}`);
      toast.success('Deleted');
      if (selectedId === id) { setSelectedId(null); setDraft(emptyFlow); }
      loadFlows();
    } catch { toast.error('Failed to delete'); }
  };

  const duplicateFlow = async (f: BotFlow) => {
    try {
      await api.post(`/admin/bot-flows/${f._id}/duplicate`);
      toast.success('Duplicated');
      loadFlows();
    } catch { toast.error('Failed to duplicate'); }
  };

  const editFlowHeader = (f: BotFlow) => {
    setEditingId(f._id);
    setFormName(f.name);
    setFormKey(f.key);
    setFormTrigger(f.trigger);
    setShowForm(true);
  };

  /* ── Node operations ── */
  const addNode = (type: BotNode['type'] = 'message') => {
    setDraft(d => ({ ...d, nodes: [...d.nodes, makeNode(type)] }));
  };

  const updateNode = (id: string, patch: Partial<BotNode>) => {
    setDraft(d => ({ ...d, nodes: d.nodes.map(n => n.id === id ? { ...n, ...patch } : n) }));
  };

  const removeNode = (id: string) => {
    if (draft.nodes.length <= 1) { toast.error('Cannot remove the last node'); return; }
    setDraft(d => {
      const nodes = d.nodes.filter(n => n.id !== id);
      const startNode = d.startNode === id ? (nodes[0]?.id || '') : d.startNode;
      return { ...d, nodes, startNode };
    });
  };

  const moveNode = (index: number, dir: -1 | 1) => {
    setDraft(d => {
      const nodes = [...d.nodes];
      const target = index + dir;
      if (target < 0 || target >= nodes.length) return d;
      [nodes[index], nodes[target]] = [nodes[target], nodes[index]];
      return { ...d, nodes };
    });
  };

  const setStartNode = (id: string) => {
    setDraft(d => ({ ...d, startNode: id }));
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const payload = { ...draft };
      await api.put(`/admin/bot-flows/${selectedId}`, payload);
      toast.success('Flow saved');
      loadFlows();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  /* ── Test ── */
  const runTest = async () => {
    if (!selectedId || !testInput.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post(`/admin/bot-flows/${selectedId}/test`, { userText: testInput.trim() });
      setTestResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Test failed');
    } finally { setTesting(false); }
  };

  const selectedFlow = flows.find(f => f._id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bot size={24} /> Virtual Agent Designer</h1>
        <button onClick={() => { setEditingId(null); setFormName(''); setFormKey(''); setFormTrigger(''); setShowForm(true); }} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> New Flow
        </button>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{editingId ? 'Edit Flow' : 'New Flow'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateFlow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input required value={formName} onChange={e => setFormName(e.target.value)} className="mt-1 input-field w-full" placeholder="e.g. Password Reset Bot" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Key *</label>
                <input required value={formKey} onChange={e => setFormKey(e.target.value)} className="mt-1 input-field w-full" placeholder="e.g. password_reset" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trigger</label>
                <input value={formTrigger} onChange={e => setFormTrigger(e.target.value)} className="mt-1 input-field w-full" placeholder="e.g. forgot password" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* ── Left panel: flow list ── */}
        <div className="w-80 shrink-0 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
          ) : flows.length === 0 ? (
            <div className="card p-6 text-center text-gray-500 text-sm">No flows yet. Click "New Flow" to get started.</div>
          ) : (
            flows.map(f => (
              <div
                key={f._id}
                className={`card p-4 cursor-pointer transition border-2 ${selectedId === f._id ? 'border-indigo-500 bg-indigo-50/40' : 'border-transparent hover:border-gray-200'}`}
                onClick={() => selectFlow(f)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm text-gray-900">{f.name}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {f.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">key: {f.key}</p>
                {f.trigger && <p className="text-xs text-gray-500 mb-1">trigger: {f.trigger}</p>}
                <p className="text-xs text-gray-400 mb-2">{(f.nodes || []).length} node(s)</p>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => editFlowHeader(f)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit"><Edit size={13} /></button>
                  <button onClick={() => duplicateFlow(f)} className="p-1 text-gray-400 hover:text-amber-600" title="Duplicate"><Copy size={13} /></button>
                  <button onClick={() => deleteFlow(f._id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right panel: designer ── */}
        <div className="flex-1 min-w-0">
          {!selectedId || !selectedFlow ? (
            <div className="card p-12 text-center text-gray-400">
              <Bot size={48} className="mx-auto mb-3 opacity-40" />
              <p>Select a flow to edit or create a new one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Flow header bar */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{draft.name}</h2>
                  <span className="text-xs font-mono text-gray-500">key: {draft.key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={e => setDraft(d => ({ ...d, enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Enabled
                  </label>
                  <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Flow'}</button>
                </div>
              </div>

              {/* Add node buttons */}
              <div className="flex flex-wrap gap-2">
                {NODE_TYPES.filter(t => t.value !== 'start').map(t => (
                  <button
                    key={t.value}
                    onClick={() => addNode(t.value)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition"
                  >
                    <Plus size={12} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Nodes list */}
              <div className="space-y-3">
                {draft.nodes.map((node, idx) => {
                  const typeInfo = NODE_TYPES.find(t => t.value === node.type);
                  const isStart = draft.startNode === node.id;
                  return (
                    <div key={node.id} className={`card p-4 border-l-4 transition ${isStart ? 'border-l-indigo-500 bg-indigo-50/30' : 'border-l-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {NODE_ICONS[node.type]}
                          </span>
                          <span className="text-xs font-mono text-gray-400 w-6">#{idx + 1}</span>
                          <input
                            value={node.label}
                            onChange={e => updateNode(node.id, { label: e.target.value })}
                            className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 w-48"
                            placeholder="Label"
                          />
                          {isStart && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">START</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveNode(idx, -1)} disabled={idx === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30" title="Move up"><ChevronUp size={14} /></button>
                          <button onClick={() => moveNode(idx, 1)} disabled={idx === draft.nodes.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30" title="Move down"><ChevronDown size={14} /></button>
                          <button onClick={() => setStartNode(node.id)} className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${isStart ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'}`} title="Set as start">
                            Set start
                          </button>
                          <button onClick={() => removeNode(node.id)} className="p-1 text-gray-300 hover:text-red-500" title="Remove"><Trash2 size={13} /></button>
                        </div>
                      </div>

                      {/* Type & text */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Type</label>
                          <select value={node.type} onChange={e => updateNode(node.id, { type: e.target.value as BotNode['type'] })} className="input-field w-full text-sm">
                            {NODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          {typeInfo && <p className="text-[10px] text-gray-400 mt-0.5">{typeInfo.desc}</p>}
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Text</label>
                          <textarea
                            rows={2}
                            value={node.text}
                            onChange={e => updateNode(node.id, { text: e.target.value })}
                            className="input-field w-full text-sm"
                            placeholder="Bot message text..."
                          />
                        </div>
                      </div>

                      {/* Next */}
                      <div className="mt-2">
                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Next Node</label>
                        <select value={node.next} onChange={e => updateNode(node.id, { next: e.target.value })} className="input-field w-full text-sm">
                          <option value="">-- none --</option>
                          {draft.nodes.filter(n => n.id !== node.id).map(n => (
                            <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Options (question) */}
                      {node.type === 'question' && (
                        <div className="mt-2">
                          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Options (comma-separated)</label>
                          <input value={node.options} onChange={e => updateNode(node.id, { options: e.target.value })} className="input-field w-full text-sm" placeholder="Yes, No, Maybe" />
                        </div>
                      )}

                      {/* Conditions (condition) */}
                      {node.type === 'condition' && (
                        <div className="mt-2">
                          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Conditions (comma-separated, format: if:value:nextNodeId)</label>
                          <input value={node.conditions} onChange={e => updateNode(node.id, { conditions: e.target.value })} className="input-field w-full text-sm" placeholder="if:password:abc123, if:reset:def456" />
                        </div>
                      )}

                      {/* Connector arrow */}
                      {node.next && idx < draft.nodes.length - 1 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-indigo-400">
                          <ArrowRight size={12} />
                          <span>→ {draft.nodes.find(n => n.id === node.next)?.label || node.next}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Test panel */}
              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1"><Play size={14} /> Test Flow</h3>
                <div className="flex gap-2">
                  <input
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') runTest(); }}
                    className="input-field flex-1 text-sm"
                    placeholder="Type a user message to test..."
                  />
                  <button onClick={runTest} disabled={testing || !testInput.trim()} className="btn-primary">{testing ? 'Testing...' : 'Test'}</button>
                </div>
                {testResult && (
                  <div className={`p-3 rounded-lg text-sm ${testResult.matched ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className="font-medium text-gray-700 mb-1">{testResult.matched ? 'Matched' : 'No match'}</p>
                    <p className="text-gray-600">{testResult.reply}</p>
                    {testResult.nodeId && <p className="text-xs text-gray-400 mt-1">node: {testResult.nodeId}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
