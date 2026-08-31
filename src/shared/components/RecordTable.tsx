import React, { useState, useEffect } from 'react';
import { useGetRecordsQuery, useCreateRecordMutation, useDeleteRecordMutation, useUpdateRecordMutation } from '@shared/store/crudApi';
import { RefSelect } from './RefSelect';

// ---- Sortable / Filterable / Paginated / Bulk-Enabled Record Table ----
export function RecordTable({ entity, columns, onRowClick, extraFilters }: {
  entity: string;
  columns: Array<{ key: string; label: string; render?: (v: any, row: any) => React.ReactNode }>;
  onRowClick?: (row: any) => void;
  extraFilters?: Record<string, string>;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

  const { data, isLoading, refetch } = useGetRecordsQuery({
    entity, page, limit: 25, search: search || undefined,
    sortBy, sortDir, ...extraFilters,
  });
  const [updateRecord] = useUpdateRecordMutation();
  const records = data?.records || [];
  const allSelected = records.length > 0 && records.every((r: any) => selected.has(r._id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(records.map((r: any) => r._id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const applyBulk = async () => {
    if (!bulkStatus || !selected.size) return;
    for (const id of selected) {
      try { await updateRecord({ entity, id, body: { status: bulkStatus } }).unwrap(); } catch (_) {}
    }
    setSelected(new Set()); setBulkStatus(''); refetch();
  };

  if (isLoading) return <div className="p-6 text-gray-400 animate-pulse">Loading {entity}…</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={`Search ${entity}…`} className="input-field max-w-xs" />
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">+ New</button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-2 flex items-center gap-3 text-sm">
          <span className="font-medium text-brand-700">{selected.size} selected</span>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="input-field text-xs py-1 w-36">
            <option value="">Set status…</option>
            {['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'].map(s2 => <option key={s2} value={s2}>{s2}</option>)}
          </select>
          <button onClick={applyBulk} disabled={!bulkStatus} className="btn-primary text-xs py-1 disabled:opacity-40">Apply</button>
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 text-xs ml-auto">Clear selection</button>
        </div>
      )}

      {showCreate && <RecordFormInline entity={entity} editable={data?.editable} refs={data?.refs} onDone={() => { setShowCreate(false); refetch(); }} />}

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" /></th>
              {columns.map(col => (
                <th key={col.key} onClick={() => { setSortBy(col.key); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
                  className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  {col.label} {sortBy === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              ))}
              <th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((row: any) => (
              <tr key={row._id}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${selected.has(row._id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-2" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(row._id)} onChange={() => toggleOne(row._id)} className="rounded" />
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2.5 text-sm text-gray-600">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <DeleteBtn entity={entity} id={row._id} onDeleted={refetch} />
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-400">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="btn-secondary px-2 py-1 disabled:opacity-30">‹</button>
            <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page >= data.totalPages} className="btn-secondary px-2 py-1 disabled:opacity-30">›</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Inline Create Form with RefSelect for reference fields ----
export function RecordFormInline({ entity, editable, refs, onDone }: {
  entity: string; editable?: string[]; refs?: string[]; onDone?: () => void;
}) {
  const [create] = useCreateRecordMutation();
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const fields = editable || [];

  // Map ref field names to their source entities
  const refEntityMap: Record<string, string> = {
    assignedTo: 'agent', requester: 'user', owner: 'agent',
    department: 'company', sla: 'sla_target', manager: 'agent',
    technician: 'agent', company: 'company', contact: 'user',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try { await create({ entity, body: values }).unwrap(); setValues({}); onDone?.(); }
    catch (err: any) { setError(err?.data?.error || 'Creation failed'); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map((f: string) => {
          const isRef = refs?.includes(f);
          const refEntity = refEntityMap[f];
          return (
            <div key={f}>
              <label className="block text-xs font-medium text-gray-500 capitalize mb-1">{f.replace(/([A-Z])/g, ' $1').trim()}</label>
              {isRef && refEntity ? (
                <RefSelect entity={refEntity} value={values[f]} onChange={v => setValues(v2 => ({ ...v2, [f]: v }))} />
              ) : ['status', 'priority', 'severity', 'category'].includes(f) ? (
                <select value={values[f] ?? ''} onChange={e => setValues(v => ({ ...v, [f]: e.target.value }))} className="input-field w-full">
                  <option value="">Select…</option>
                  {(f === 'status' ? ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'] :
                    f === 'priority' ? ['low', 'medium', 'high', 'critical'] :
                    f === 'severity' ? ['low', 'medium', 'high', 'critical'] :
                    ['default']).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input value={values[f] ?? ''} onChange={e => setValues(v => ({ ...v, [f]: e.target.value }))} className="input-field w-full" placeholder={f} />
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function DeleteBtn({ entity, id, onDeleted }: { entity: string; id: string; onDeleted?: () => void }) {
  const [del] = useDeleteRecordMutation();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return (
    <button onClick={e => { e.stopPropagation(); setConfirming(true); }} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
  );
  return (
    <span className="flex gap-1">
      <button onClick={async e => { e.stopPropagation(); try { await del({ entity, id }).unwrap(); onDeleted?.(); } catch (_) {} }} className="text-red-500 hover:text-red-700 text-xs font-bold">✓</button>
      <button onClick={e => { e.stopPropagation(); setConfirming(false); }} className="text-gray-400 text-xs">↩</button>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', new: 'bg-blue-100 text-blue-700',
    assigned: 'bg-indigo-100 text-indigo-700', in_progress: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500', active: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-500', published: 'bg-green-100 text-green-700',
    critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700', low: 'bg-gray-100 text-gray-500',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}
