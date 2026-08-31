import { useGetAuthorityDocsQuery, useAddAuthorityDocMutation, useGetGrcQuestionnairesQuery, useAddGrcQuestionnaireMutation, useRespondGrcQuestionnaireMutation, useGetPrivacyAssessmentsQuery, useAddPrivacyAssessmentMutation, useGetCrisisEventsQuery, useAddCrisisEventMutation, useCrisisActionMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { ScrollText, Plus, Send, XCircle, CheckCircle } from 'lucide-react';

type Tab = 'authorities' | 'questionnaires' | 'privacy' | 'crisis';

export default function GovernanceExtras() {
  const [tab, setTab] = useState<Tab>('authorities');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const flash = (m: string) => { setOk(m); setTimeout(() => setOk(null), 3000); };
  const run = async (fn: () => Promise<any>, msg: string) => {
    setErr(null); setOk(null);
    try { await fn(); flash(msg); } catch (e: any) { setErr(e?.data?.message || 'Request failed'); }
  };

  /* Authorities */
  const { data: docs } = useGetAuthorityDocsQuery();
  const [addAuthorityDoc] = useAddAuthorityDocMutation();
  const [docForm, setDocForm] = useState({ code: '', title: '', jurisdiction: '' });

  /* Questionnaires */
  const { data: questionnaires } = useGetGrcQuestionnairesQuery();
  const [addGrcQuestionnaire] = useAddGrcQuestionnaireMutation();
  const [respondGrcQuestionnaire] = useRespondGrcQuestionnaireMutation();
  const [qName, setQName] = useState('');
  const [respForm, setRespForm] = useState<{ id: string; thirdPartyId: string; answers: string }>({ id: '', thirdPartyId: '', answers: '{}' });
  const [scores, setScores] = useState<Record<string, any>>({});

  /* Privacy */
  const { data: assessments } = useGetPrivacyAssessmentsQuery();
  const [addPrivacyAssessment] = useAddPrivacyAssessmentMutation();
  const [paForm, setPaForm] = useState({ activity: '', riskLevel: 'low', dpiaRequired: false });

  /* Crisis */
  const { data: events } = useGetCrisisEventsQuery();
  const [addCrisisEvent] = useAddCrisisEventMutation();
  const [crisisAction] = useCrisisActionMutation();
  const [eventForm, setEventForm] = useState({ name: '', severity: 'medium' });
  const [actionText, setActionText] = useState<Record<string, string>>({});

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'authorities', label: 'Authorities' },
    { key: 'questionnaires', label: 'Questionnaires' },
    { key: 'privacy', label: 'Privacy' },
    { key: 'crisis', label: 'Crisis' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ScrollText className="h-6 w-6" /> Governance Extras</h1>
        {(err || ok) && (
          err ? (
            <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> {err}</div>
          ) : (
            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {ok}</div>
          )
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Authorities */}
      {tab === 'authorities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold mb-4">Authority Documents</h2>
            <ul className="divide-y divide-gray-100">
              {(docs || []).map((d: any) => (
                <li key={d._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{d.code}</code>{d.title}</p>
                    <p className="text-xs text-gray-500">{d.jurisdiction}</p>
                  </div>
                  <span className="text-sm text-gray-600">{(d.citations || []).length} citations</span>
                </li>
              ))}
              {(!docs || !docs.length) && <li className="py-3 text-sm text-gray-500">No authority documents.</li>}
            </ul>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => addAuthorityDoc(docForm).unwrap(), 'Authority doc added');
              setDocForm({ code: '', title: '', jurisdiction: '' });
            }}
            className="card p-6 space-y-3 h-fit"
          >
            <h2 className="font-semibold">Add Authority Doc</h2>
            <input type="text" required placeholder="Code (e.g. ISO-27001)" value={docForm.code} onChange={(e) => setDocForm({ ...docForm, code: e.target.value })} className="input-field" />
            <input type="text" required placeholder="Title" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} className="input-field" />
            <input type="text" placeholder="Jurisdiction" value={docForm.jurisdiction} onChange={(e) => setDocForm({ ...docForm, jurisdiction: e.target.value })} className="input-field" />
            <button type="submit" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
          </form>
        </div>
      )}

      {/* Questionnaires */}
      {tab === 'questionnaires' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-2">
            <h2 className="font-semibold mb-2">Questionnaires</h2>
            {(questionnaires || []).map((q: any) => (
              <div key={q._id} className={`rounded-lg border p-3 space-y-2 ${respForm.id === q._id ? 'border-indigo-400 bg-indigo-50/40' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{q.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{(q.responses || []).length} responses</span>
                    <button
                      onClick={() => setRespForm({ id: q._id, thirdPartyId: respForm.thirdPartyId, answers: '{}' })}
                      className={`text-xs font-medium ${respForm.id === q._id ? 'text-indigo-700 underline' : 'text-indigo-600 hover:text-indigo-800'}`}
                    >
                      respond inline →
                    </button>
                  </div>
                </div>
                {respForm.id === q._id && (
                  <div className="space-y-2 pt-1 border-t border-indigo-100 mt-1">
                    {scores[q._id] != null && (
                      <p className="text-sm font-semibold text-green-700">Score: {typeof scores[q._id] === 'object' ? JSON.stringify(scores[q._id]) : String(scores[q._id])}</p>
                    )}
                    <input type="text" placeholder="Third-party ID" value={respForm.thirdPartyId} onChange={(e) => setRespForm({ ...respForm, thirdPartyId: e.target.value })} className="input-field" />
                    <textarea rows={4} placeholder='Answers JSON, e.g. {"q1":"yes"}' value={respForm.answers} onChange={(e) => setRespForm({ ...respForm, answers: e.target.value })} className="w-full input-field font-mono text-xs" />
                    <button
                      onClick={() => {
                        let answers: any;
                        try { answers = JSON.parse(respForm.answers || '{}'); } catch { setErr('Invalid answers JSON'); return; }
                        run(async () => {
                          const res = await respondGrcQuestionnaire({ id: respForm.id, thirdPartyId: respForm.thirdPartyId, answers }).unwrap();
                          setScores((s) => ({ ...s, [respForm.id]: (res as any)?.score ?? res }));
                        }, 'Response submitted');
                      }}
                      disabled={!respForm.id}
                      className="btn-primary inline-flex items-center gap-2 text-xs"
                    >
                      <Send className="h-3 w-3" /> Submit Response
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(!questionnaires || !questionnaires.length) && <p className="text-sm text-gray-500">No questionnaires yet.</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => addGrcQuestionnaire({ name: qName }).unwrap(), 'Questionnaire added');
              setQName('');
            }}
            className="card p-6 space-y-3 h-fit"
          >
            <h2 className="font-semibold">Add Questionnaire</h2>
            <input type="text" required placeholder="Name" value={qName} onChange={(e) => setQName(e.target.value)} className="input-field" />
            <button type="submit" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
          </form>
        </div>
      )}

      {/* Privacy */}
      {tab === 'privacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold mb-4">Privacy Assessments</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Activity</th>
                  <th className="py-2 pr-4">Risk Level</th>
                  <th className="py-2">DPIA Required</th>
                </tr>
              </thead>
              <tbody>
                {(assessments || []).map((a: any) => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{a.activity}</td>
                    <td className="py-2 pr-4 capitalize">{a.riskLevel}</td>
                    <td className="py-2">{a.dpiaRequired ? <CheckCircle className="h-4 w-4 text-green-600" /> : '—'}</td>
                  </tr>
                ))}
                {(!assessments || !assessments.length) && <tr><td colSpan={3} className="py-3 text-gray-500">No assessments yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => addPrivacyAssessment(paForm).unwrap(), 'Assessment added');
              setPaForm({ activity: '', riskLevel: 'low', dpiaRequired: false });
            }}
            className="card p-6 space-y-3 h-fit"
          >
            <h2 className="font-semibold">Add Assessment</h2>
            <input type="text" required placeholder="Processing activity" value={paForm.activity} onChange={(e) => setPaForm({ ...paForm, activity: e.target.value })} className="input-field" />
            <select value={paForm.riskLevel} onChange={(e) => setPaForm({ ...paForm, riskLevel: e.target.value })} className="input-field capitalize">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={paForm.dpiaRequired} onChange={(e) => setPaForm({ ...paForm, dpiaRequired: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
              DPIA required
            </label>
            <button type="submit" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
          </form>
        </div>
      )}

      {/* Crisis */}
      {tab === 'crisis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(events || []).map((ev: any) => {
              const active = ev.status !== 'stood_down';
              return (
                <div key={ev._id} className="card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{ev.name || ev.title}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        ev.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        ev.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        ev.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
                      }`}>{ev.severity}</span>
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-red-600' : 'text-gray-400'}`}>{active ? 'ACTIVE' : 'STOOD DOWN'}</span>
                  </div>

                  {!!(ev.actions || []).length && (
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 max-h-28 overflow-y-auto">
                      {(ev.actions || []).map((a: any, i: number) => (
                        <li key={i}>{typeof a === 'string' ? a : a.action || JSON.stringify(a)}</li>
                      ))}
                    </ul>
                  )}

                  {active && (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add action log entry..."
                          value={actionText[ev._id] || ''}
                          onChange={(e) => setActionText({ ...actionText, [ev._id]: e.target.value })}
                          className="input-field text-sm"
                        />
                        <button
                          onClick={() => {
                            if (!actionText[ev._id]?.trim()) return;
                            run(() => crisisAction({ id: ev._id, action: actionText[ev._id].trim() }).unwrap(), 'Action logged');
                            setActionText({ ...actionText, [ev._id]: '' });
                          }}
                          className="btn-secondary inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <Plus className="h-3 w-3" /> Action
                        </button>
                      </div>
                      <button
                        onClick={() => run(() => crisisAction({ id: ev._id, action: 'stand_down' }).unwrap(), 'Event stood down')}
                        className="btn-secondary text-xs w-full"
                      >
                        Stand Down
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {(!events || !events.length) && <p className="text-sm text-gray-500">No crisis events.</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => addCrisisEvent(eventForm).unwrap(), 'Crisis event created');
              setEventForm({ name: '', severity: 'medium' });
            }}
            className="card p-6 space-y-3 h-fit"
          >
            <h2 className="font-semibold">New Crisis Event</h2>
            <input type="text" required placeholder="Event name" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} className="input-field" />
            <select value={eventForm.severity} onChange={(e) => setEventForm({ ...eventForm, severity: e.target.value })} className="input-field capitalize">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
            <button type="submit" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Create Event</button>
          </form>
        </div>
      )}
    </div>
  );
}
