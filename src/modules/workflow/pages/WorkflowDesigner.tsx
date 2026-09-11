import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { Workflow, GripVertical, Trash2, Save } from 'lucide-react';
import { useAuth } from '@core/auth/useAuth';
import toast from 'react-hot-toast';

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
  const { hasPermission } = useAuth();
  const canManage = hasPermission('workflow.manage');
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [workflowId, setWorkflowId] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    (async () => {
      if (!canManage) {
        setLoadError('You do not have permission to manage workflows.');
        return;
      }
      setLoadError('');
      try {
        const res = await api.get('/enterprise/workflows');
        const rows = Array.isArray(res.data) ? res.data : (res.data.workflows || res.data.data || []);
        setWorkflows(rows);
      } catch (error: any) { setLoadError(error?.response?.data?.error || 'Unable to load workflows.'); }
    })();
  }, [canManage]);

  const pickWorkflow = async (id: string) => {
    if (!canManage) return;
    setWorkflowId(id);
    setSaved(false);
    if (!id) {
      setSteps([]);
      return;
    }
    try {
      const res = await api.get('/enterprise/workflows/' + id);
      setSteps(Array.isArray(res.data?.actions) ? res.data.actions : []);
    } catch (error: any) {
      const row = workflows.find(w => w._id === id) || null;
      setSteps(row && Array.isArray(row.actions) ? row.actions : []);
      toast.error(error?.response?.data?.error || 'Unable to load workflow details.');
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
    if (!workflowId || !canManage) return;
    try {
      await api.put('/enterprise/workflows/' + workflowId, { actions: steps });
      setSaved(true);
    } catch (error: any) { toast.error(error?.response?.data?.error || 'Unable to save workflow.'); }
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
            disabled={!workflowId || !canManage}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save
          </button>
          {saved && <span className="text-sm font-medium text-green-600">Saved</span>}
        </div>
      </div>

      {loadError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{loadError}</p>}

      <div className="flex gap-4">
        <aside className="w-48 shrink-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Action types</p>
          {ACTION_TYPES.map(t => (
            <div
              key={t}
              draggable={canManage}
              onDragStart={e => e.dataTransfer.setData('type', t)}
              className="cursor-grab active:cursor-grabbing bg-white border rounded-lg px-3 py-2 text-sm shadow-sm hover:border-blue-400 select-none disabled:opacity-50"
            >
              {t}
            </div>
          ))}
        </aside>

        <div
          className="flex-1 min-h-[34rem] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3"
          onDragOver={e => canManage && e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const idx = e.dataTransfer.getData('idx');
            const type = e.dataTransfer.getData('type');
            if (idx !== '') return;
            if (canManage && type) addStep(type);
          }}
        >
          {steps.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-20">Drag action types here to build the workflow</p>
          )}
          {steps.map((step, index) => (
            <div
              key={index}
              draggable={canManage}
              onDragStart={e => {
                e.dataTransfer.setData('type', step.type);
                e.dataTransfer.setData('idx', String(index));
              }}
              onDragOver={e => canManage && e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const from = e.dataTransfer.getData('idx');
                const type = e.dataTransfer.getData('type');
                if (from !== '') {
                  const parsed = parseInt(from, 10);
                  if (canManage && !isNaN(parsed)) moveStep(parsed, index);
                  return;
                }
                if (canManage && type) addStep(type);
              }}
              className="bg-white border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  value={step.name}
                  disabled={!canManage}
                  onChange={e => updateStep(index, { name: e.target.value })}
                  className="border rounded px-2 py-1 text-sm w-44"
                />
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{step.type}</span>
                <label className="text-xs text-gray-500 ml-auto">Delay (min)</label>
                <input
                  type="number"
                  value={step.delayMinutes}
                  disabled={!canManage}
                  onChange={e => updateStep(index, { delayMinutes: Number(e.target.value) || 0 })}
                  className="border rounded px-2 py-1 text-sm w-20"
                />
                <button disabled={!canManage} onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700 disabled:opacity-40">
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
