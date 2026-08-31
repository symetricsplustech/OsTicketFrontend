import { useGetSalesPipelinesQuery, useAddSalesPipelineMutation, useGetOppMetaQuery, useUpdateOppMetaMutation } from '@shared/store/apiEndpoints';
import { useEffect, useState } from 'react';
import { GitBranch, Plus, Save, XCircle, CheckCircle } from 'lucide-react';

interface Stage { key: string; probability?: number }
interface OppMeta {
  competitors?: string[];
  stakeholders?: Array<{ name: string; role: string; influence?: string }>;
  mutualActionPlan?: Array<{ step: string; done: boolean }>;
  pipelineId?: string;
}

export default function SalesPipelines() {
  const { data: pipelines, refetch } = useGetSalesPipelinesQuery();
  const [addSalesPipeline] = useAddSalesPipelineMutation();
  const [updateOppMeta] = useUpdateOppMetaMutation();

  const [newName, setNewName] = useState('');
  const [stagesText, setStagesText] = useState('');
  const [stageProbs, setStageProbs] = useState<Record<string, string>>({});

  const [oppIdInput, setOppIdInput] = useState('');
  const [loadedOppId, setLoadedOppId] = useState('');
  const { data: meta, isLoading: metaLoading } = useGetOppMetaQuery(loadedOppId, { skip: !loadedOppId });

  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState('');
  const [stakeholders, setStakeholders] = useState<Array<{ name: string; role: string; influence: string }>>([]);
  const [mapSteps, setMapSteps] = useState<Array<{ step: string; done: boolean }>>([]);
  const [stepInput, setStepInput] = useState('');
  const [pipelineId, setPipelineId] = useState('');

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 3000); };
  const fail = (e: any) => setErr(e?.data?.message || 'Request failed');

  const parsedStages = (): Stage[] =>
    stagesText.split(',').map((s) => s.trim()).filter(Boolean)
      .map((k) => ({ key: k.replace(/\s+/g, '_').toLowerCase(), ...(stageProbs[k] ? { probability: Number(stageProbs[k]) } : {}) }));

  const handleAddPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null);
    try {
      await addSalesPipeline({ name: newName, stages: parsedStages() }).unwrap();
      flash('Pipeline added');
      setNewName(''); setStagesText(''); setStageProbs({});
      refetch();
    } catch (ex: any) { fail(ex); }
  };

  const loadMetaIntoForm = (m?: OppMeta | null) => {
    if (!m) return;
    setCompetitors(m.competitors || []);
    setStakeholders((m.stakeholders || []).map((s) => ({ name: s.name || '', role: s.role || '', influence: s.influence || '' })));
    setMapSteps(m.mutualActionPlan || []);
    setPipelineId(m.pipelineId || '');
  };

  useEffect(() => { loadMetaIntoForm(meta as OppMeta); }, [meta]);

  const handleSaveMeta = async () => {
    setErr(null); setOk(null);
    try {
      await updateOppMeta({
        id: loadedOppId,
        body: { competitors, stakeholders, mutualActionPlan: mapSteps, pipelineId },
      }).unwrap();
      flash('Opportunity meta saved');
    } catch (ex: any) { fail(ex); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><GitBranch className="h-6 w-6" /> Sales Pipelines</h1>
        {(err || ok) && (
          err ? (
            <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> {err}</div>
          ) : (
            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {ok}</div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: pipelines list + add form */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Pipelines</h2>
            <ul className="divide-y divide-gray-100">
              {(pipelines || []).map((p: any) => (
                <li key={p._id} className="py-3">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{(p.stages || []).map((s: any) => s.key).join(' → ')}</p>
                </li>
              ))}
              {(!pipelines || pipelines.length === 0) && <li className="py-3 text-sm text-gray-500">No pipelines yet.</li>}
            </ul>
          </div>

          <form onSubmit={handleAddPipeline} className="card p-5 space-y-3">
            <h2 className="font-semibold">Add Pipeline</h2>
            <input type="text" required placeholder="Pipeline name" value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" />
            <input type="text" required placeholder="Stages (comma separated)" value={stagesText} onChange={(e) => setStagesText(e.target.value)} className="input-field" />
            {stagesText.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-32 truncate">{s}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="% prob (optional)"
                  value={stageProbs[s] || ''}
                  onChange={(e) => setStageProbs({ ...stageProbs, [s]: e.target.value })}
                  className="input-field"
                />
              </div>
            ))}
            <button type="submit" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Pipeline
            </button>
          </form>
        </div>

        {/* Right: opportunity meta editor */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Opportunity Meta Editor</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Opportunity ID"
              value={oppIdInput}
              onChange={(e) => setOppIdInput(e.target.value)}
              className="input-field"
            />
            <button
              onClick={() => { setLoadedOppId(oppIdInput.trim()); }}
              disabled={!oppIdInput.trim()}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              Load
            </button>
          </div>

          {loadedOppId && metaLoading && <p className="text-sm text-gray-500">Loading meta...</p>}

          {loadedOppId && !metaLoading && (
            <div className="space-y-4">
              {/* Competitors chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {competitors.map((c, i) => (
                    <span key={`${c}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">
                      {c}
                      <button onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} className="text-indigo-500 hover:text-indigo-800">×</button>
                    </span>
                  ))}
                  {!competitors.length && <span className="text-xs text-gray-400">None</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && competitorInput.trim()) { e.preventDefault(); setCompetitors([...competitors, competitorInput.trim()]); setCompetitorInput(''); } }}
                    placeholder="Add competitor + Enter"
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => { if (competitorInput.trim()) { setCompetitors([...competitors, competitorInput.trim()]); setCompetitorInput(''); } }}
                    className="btn-secondary inline-flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stakeholders */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholders</label>
                {stakeholders.map((s, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                    <input type="text" placeholder="Name" value={s.name} onChange={(e) => setStakeholders(stakeholders.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className="input-field" />
                    <input type="text" placeholder="Role" value={s.role} onChange={(e) => setStakeholders(stakeholders.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} className="input-field" />
                    <select value={s.influence} onChange={(e) => setStakeholders(stakeholders.map((x, j) => j === i ? { ...x, influence: e.target.value } : x))} className="input-field">
                      <option value="">Influence</option>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                ))}
                <button type="button" onClick={() => setStakeholders([...stakeholders, { name: '', role: '', influence: '' }])} className="btn-secondary inline-flex items-center gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add stakeholder
                </button>
              </div>

              {/* Mutual action plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutual Action Plan</label>
                {mapSteps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={!!s.done}
                      onChange={(e) => setMapSteps(mapSteps.map((x, j) => j === i ? { ...x, done: e.target.checked } : x))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className={`text-sm ${s.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{s.step}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input type="text" placeholder="New step" value={stepInput} onChange={(e) => setStepInput(e.target.value)} className="input-field" />
                  <button
                    type="button"
                    onClick={() => { if (stepInput.trim()) { setMapSteps([...mapSteps, { step: stepInput.trim(), done: false }]); setStepInput(''); } }}
                    className="btn-secondary inline-flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pipeline select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline</label>
                <select value={pipelineId} onChange={(e) => setPipelineId(e.target.value)} className="input-field">
                  <option value="">— Select pipeline —</option>
                  {(pipelines || []).map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleSaveMeta} className="btn-primary inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Meta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
