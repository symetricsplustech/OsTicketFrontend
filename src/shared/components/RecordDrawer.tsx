import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useGetRecordQuery, useUpdateRecordMutation, useGetRelatedQuery } from '@shared/store/crudApi';
import { StatusBadge } from './RecordTable';

// ---- Slide-in Record Detail Drawer ----
export function RecordDrawer({ entity, id, onClose }: {
  entity: string; id: string; onClose: () => void;
}) {
  const { data: result } = useGetRecordQuery({ entity, id });
  const { data: related } = useGetRelatedQuery({ entity, id });
  const [update] = useUpdateRecordMutation();
  const record = result?.record;

  if (!record) return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 border-l p-6 animate-pulse">
      <p className="text-gray-400">Loading…</p>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl z-50 border-l overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-400 capitalize">{result?.label || entity}</p>
            <h2 className="text-lg font-bold text-gray-900 truncate">{record.title || record.name || record.number || id.slice(-8)}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Editable fields */}
          <EditableFields entity={entity} record={record} editable={result?.editable || []} update={update} />

          {/* All fields (read-only) */}
          <DetailSection title="All Fields">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {Object.entries(record).filter(([k]) => !k.startsWith('_') && k !== '__v').map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="text-gray-400 text-xs capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                  <dd className="text-gray-700 truncate">{typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '—')}</dd>
                </React.Fragment>
              ))}
            </dl>
          </DetailSection>

          {/* Related records */}
          {related?.length > 0 && (
            <DetailSection title="Related">
              {related.map((rel: any) => (
                <div key={rel.entity} className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">{rel.label} ({rel.count})</p>
                  {rel.records.map((r: any) => (
                    <div key={r._id} className="text-sm text-gray-600 py-0.5 border-l-2 border-brand-200 pl-2">
                      {r.title || r.name || r.number || r._id?.slice(-8)}
                    </div>
                  ))}
                </div>
              ))}
            </DetailSection>
          )}
        </div>
      </div>
    </>
  );
}

function EditableFields({ entity, record, editable, update }: any) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (record) setValues(Object.fromEntries(editable.map((f: string) => [f, record[f] ?? '']))); }, [record]);

  const save = async () => {
    try {
      await update({ entity, id: record._id, body: values }).unwrap();
      setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
  };

  return (
    <DetailSection title="Details" action={!editing ? <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:text-brand-800 font-medium">Edit</button> : undefined}>
      {!editing ? (
        <div className="space-y-2">
          {editable.map((f: string) => (
            <div key={f} className="flex items-center justify-between text-sm">
              <span className="text-gray-400 capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="font-medium">{typeof record[f] === 'boolean' ? (record[f] ? 'Yes' : 'No') : String(record[f] ?? '—')}</span>
            </div>
          ))}
          {saved && <p className="text-green-600 text-xs">✓ Saved</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {editable.map((f: string) => (
            <div key={f}>
              <label className="block text-xs font-medium text-gray-500 capitalize mb-1">{f}</label>
              {['status', 'priority', 'severity', 'category', 'stage'].includes(f) ? (
                <select value={values[f] ?? ''} onChange={e => setValues(v => ({ ...v, [f]: e.target.value }))} className="input-field">
                  {['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'new', 'triage', 'investigating',
                    'low', 'medium', 'high', 'critical', 'planning', 'active', 'on_hold', 'completed',
                    'prospect', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
                  ].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : typeof record[f] === 'boolean' ? (
                <input type="checkbox" checked={!!values[f]} onChange={e => setValues(v => ({ ...v, [f]: e.target.checked }))} className="rounded" />
              ) : (
                <input value={values[f] ?? ''} onChange={e => setValues(v => ({ ...v, [f]: e.target.value }))} className="input-field" />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm"><Save /> Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}
    </DetailSection>
  );
}

function DetailSection({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {action}
      </div>
      <div className="bg-gray-50 rounded-lg p-3">{children}</div>
    </div>
  );
}
