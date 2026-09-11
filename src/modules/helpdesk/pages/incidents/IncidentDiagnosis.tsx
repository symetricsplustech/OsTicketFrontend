import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { Stethoscope, Plus, XCircle, Save } from 'lucide-react';

interface IncidentRow {
  _id: string;
  title?: string;
  name?: string;
}

interface DiagnosisForm {
  symptoms: string[];
  affectedSystems: string[];
  rootCauseCategory: string;
  triggerEvent: string;
  contributingFactors: string[];
  confidenceLevel: number;
}

const CATEGORIES = ['hardware', 'software_bug', 'configuration', 'capacity', 'network', 'third_party', 'human_error', 'security', 'unknown'];

const EMPTY_FORM: DiagnosisForm = {
  symptoms: [],
  affectedSystems: [],
  rootCauseCategory: 'unknown',
  triggerEvent: '',
  contributingFactors: [],
  confidenceLevel: 50,
};

function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft('');
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={`Add ${label.toLowerCase()}`}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full text-sm"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="hover:text-red-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function IncidentDiagnosis() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [incidentId, setIncidentId] = useState('');
  const [form, setForm] = useState<DiagnosisForm>({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/enterprise/incidents');
        const rows = Array.isArray(res.data) ? res.data : (res.data.incidents || res.data.data || []);
        setIncidents(rows);
      } catch {}
    })();
  }, []);

  const pickIncident = async (id: string) => {
    setIncidentId(id);
    setSaved(false);
    if (!id) {
      setForm({ ...EMPTY_FORM });
      return;
    }
    try {
      const res = await api.get(`/ops/incidents/${id}/diagnosis`);
      const d = res.data?.diagnosis || res.data;
      if (d && typeof d === 'object') {
        setForm({
          symptoms: Array.isArray(d.symptoms) ? d.symptoms : [],
          affectedSystems: Array.isArray(d.affectedSystems) ? d.affectedSystems : [],
          rootCauseCategory: d.rootCauseCategory || 'unknown',
          triggerEvent: d.triggerEvent || '',
          contributingFactors: Array.isArray(d.contributingFactors) ? d.contributingFactors : [],
          confidenceLevel: typeof d.confidenceLevel === 'number' ? d.confidenceLevel : 50,
        });
      } else {
        setForm({ ...EMPTY_FORM });
      }
    } catch {
      setForm({ ...EMPTY_FORM });
    }
  };

  const save = async () => {
    if (!incidentId) return;
    try {
      await api.put(`/ops/incidents/${incidentId}/diagnosis`, form);
      setSaved(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Stethoscope className="h-6 w-6" /> Incident Diagnosis</h1>
        <select
          value={incidentId}
          onChange={e => pickIncident(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Select incident</option>
          {incidents.map(inc => (
            <option key={inc._id} value={inc._id}>{inc.title || inc.name || inc._id}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-5">
        {!incidentId ? (
          <p className="text-sm text-gray-400 text-center py-12">Select an incident to capture its structured diagnosis.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <TagInput label="Symptoms" values={form.symptoms} onChange={symptoms => setForm({ ...form, symptoms })} />
              <TagInput
                label="Affected Systems"
                values={form.affectedSystems}
                onChange={affectedSystems => setForm({ ...form, affectedSystems })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Root cause category</label>
                <select
                  value={form.rootCauseCategory}
                  onChange={e => setForm({ ...form, rootCauseCategory: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger event</label>
                <input
                  value={form.triggerEvent}
                  onChange={e => setForm({ ...form, triggerEvent: e.target.value })}
                  placeholder="What triggered this incident?"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <TagInput
              label="Contributing Factors"
              values={form.contributingFactors}
              onChange={contributingFactors => setForm({ ...form, contributingFactors })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence level: <span className="font-bold text-blue-600">{form.confidenceLevel}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.confidenceLevel}
                onChange={e => setForm({ ...form, confidenceLevel: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={save}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              {saved && <span className="text-sm font-medium text-green-600">Diagnosis saved</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
