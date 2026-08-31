import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { Workflow, GripVertical, Trash2, Save } from 'lucide-react';

interface BranchCondition {
  field: string;
  operator: string;
  value: string;
}

interface Step {
  name: string;
  type: string;
  delayMinutes: number;
  branchCondition?: BranchCondition;
  thenActions?: Step[];
  elseActions?: Step[];
}

interface WorkflowRow {
  _id: string;
  name?: string;
  actions?: Step[];
}

const ACTION_TYPES = ['send_email', 'notify_agent', 'notify_customer', 'create_task', 'set_sla', 'wait', 'call_api', 'send_webhook', 'condition'];
const OPERATORS = ['equals', 'not_equals', 'contains', 'gt', 'lt', 'exists'];
const BRANCHES = ['thenActions', 'elseActions'] as const;

const newStep = (type: string): Step => ({ name: type, type, delayMinutes: 0 });

export default function WorkflowDesigner() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [workflowId, setWorkflowId] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/enterprise/workflows');
        const rows = Array.isArray(res.data) ? res.data : (res.data.workflows || res.data.data || []);
        setWorkflows(rows);
      } catch {}
    })();
  }, []);

  const pickWorkflow = async (id: string) => {
    setWorkflowId(id);
    setSaved(false);
    if (!id) {
      setSteps([]);
      return;
    }
    try {
      const res = await api.get('/enterprise/workflows/' + id);
      setSteps(Array.isArray(res.data?.actions) ? res.data.actions : []);
    } catch {
      const row = workflows.find(w => w._id === id) || null;
      setSteps(row && Array.isArray(row.actions) ? row.actions : []);
    }
  };

  const addStep = (type: string) => setSteps(prev => [...prev, newStep(type)]);

  const updateStep = (index: number, patch: Partial<Step>) =>
    setSteps(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const removeStep = (index: number) => setSteps(prev => prev.filter((_, i) => i !== index));

  const moveStep = (from: number, to: number) =>
    setSteps(prev => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const addToBranch = (index: number, branch: typeof BRANCHES[number], type: string) =>
    setSteps(prev =>
      prev.map((s, i) => (i === index ? { ...s, [branch]: [...(s[branch] || []), newStep(type)] } : s))
    );

  const removeFromBranch = (index: number, branch: typeof BRANCHES[number], itemIndex: number) =>
    setSteps(prev =>
      prev.map((s, i) => (i === index ? { ...s, [branch]: (s[branch] || []).filter((_, j) => j !== itemIndex) } : s))
    );

  const toggleBranch = (key: string) => setOpenBranches(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    if (!workflowId) return;
    try {
      await api.put('/enterprise/workflows/' + workflowId, { actions: steps });
      setSaved(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Workflow className="h-6 w-6" /> Workflow Designer</h1>
        <div className="flex items-center gap-3">
          <select
            value={workflowId}
            onChange={e => pickWorkflow(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Select workflow</option>
            {workflows.map(w => (
              <option key={w._id} value={w._id}>{w.name || w._id}</option>
            ))}
          </select>
          <button
            onClick={save}
            disabled={!workflowId}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save
          </button>
          {saved && <span className="text-sm font-medium text-green-600">Saved</span>}
        </div>
      </div>

      <div className="flex gap-4">
        <aside className="w-48 shrink-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Action types</p>
          {ACTION_TYPES.map(t => (
            <div
              key={t}
              draggable={true}
              onDragStart={e => e.dataTransfer.setData('type', t)}
              className="cursor-grab active:cursor-grabbing bg-white border rounded-lg px-3 py-2 text-sm shadow-sm hover:border-blue-400 select-none"
            >
              {t}
            </div>
          ))}
        </aside>

        <div
          className="flex-1 min-h-[34rem] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const idx = e.dataTransfer.getData('idx');
            const type = e.dataTransfer.getData('type');
            if (idx !== '') return;
            if (type) addStep(type);
          }}
        >
          {steps.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-20">Drag action types here to build the workflow</p>
          )}
          {steps.map((step, index) => (
            <div
              key={index}
              draggable={true}
              onDragStart={e => {
                e.dataTransfer.setData('type', step.type);
                e.dataTransfer.setData('idx', String(index));
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const from = e.dataTransfer.getData('idx');
                const type = e.dataTransfer.getData('type');
                if (from !== '') {
                  const parsed = parseInt(from, 10);
                  if (!isNaN(parsed)) moveStep(parsed, index);
                  return;
                }
                if (type) addStep(type);
              }}
              className="bg-white border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  value={step.name}
                  onChange={e => updateStep(index, { name: e.target.value })}
                  className="border rounded px-2 py-1 text-sm w-44"
                />
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{step.type}</span>
                <label className="text-xs text-gray-500 ml-auto">Delay (min)</label>
                <input
                  type="number"
                  value={step.delayMinutes}
                  onChange={e => updateStep(index, { delayMinutes: Number(e.target.value) || 0 })}
                  className="border rounded px-2 py-1 text-sm w-20"
                />
                <button onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {step.type === 'condition' && (
                <div className="mt-3 pl-8 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">If</span>
                    <input
                      placeholder="Field"
                      value={step.branchCondition?.field || ''}
                      onChange={e =>
                        updateStep(index, {
                          branchCondition: {
                            field: e.target.value,
                            operator: step.branchCondition?.operator || 'equals',
                            value: step.branchCondition?.value || '',
                          },
                        })
                      }
                      className="border rounded px-2 py-1 text-sm w-36"
                    />
                    <select
                      value={step.branchCondition?.operator || 'equals'}
                      onChange={e =>
                        updateStep(index, {
                          branchCondition: {
                            field: step.branchCondition?.field || '',
                            operator: e.target.value,
                            value: step.branchCondition?.value || '',
                          },
                        })
                      }
                      className="border rounded px-2 py-1 text-sm bg-white"
                    >
                      {OPERATORS.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Value"
                      value={step.branchCondition?.value || ''}
                      onChange={e =>
                        updateStep(index, {
                          branchCondition: {
                            field: step.branchCondition?.field || '',
                            operator: step.branchCondition?.operator || 'equals',
                            value: e.target.value,
                          },
                        })
                      }
                      className="border rounded px-2 py-1 text-sm w-36"
                    />
                  </div>

                  {BRANCHES.map(branch => {
                    const key = `${index}-${branch}`;
                    const open = openBranches[key] !== false;
                    const items = step[branch] || [];
                    return (
                      <div key={branch} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleBranch(key)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50"
                        >
                          <span>{branch}</span>
                          <span>{open ? '\u2212' : '+'}</span>
                        </button>
                        {open && (
                          <div
                            className="px-3 pb-3 space-y-2"
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const idx = e.dataTransfer.getData('idx');
                              const type = e.dataTransfer.getData('type');
                              if (idx !== '') return;
                              if (type) addToBranch(index, branch, type);
                            }}
                          >
                            {items.length === 0 && <p className="text-xs text-gray-400">Drop actions here</p>}
                            {items.map((action, ai) => (
                              <div
                                key={ai}
                                className="flex items-center justify-between bg-gray-50 border rounded px-2 py-1 text-sm"
                              >
                                <span>{action.name || action.type}</span>
                                <button
                                  onClick={() => removeFromBranch(index, branch, ai)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
