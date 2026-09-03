import React, { useEffect, useMemo, useState } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';

// ITSM-20 — Audit & History: immutable tenant-scoped audit trail with
// actor, action, resource and before/after filtering.
interface AuditEvent {
  _id: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorUserId?: string;
  realActorId?: string;
  tenantId?: string;
  before?: any;
  after?: any;
  createdAt: string;
  ip?: string;
  correlationId?: string;
}

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/enterprise/audit');
        setEvents(res.data.audit || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actions = useMemo(
    () => Array.from(new Set(events.map((e) => e.action).filter(Boolean))) as string[],
    [events],
  );

  const rows = events.filter((e) => {
    if (actionFilter && e.action !== actionFilter) return false;
    if (resourceFilter && !(e.resourceType || '').toLowerCase().includes(resourceFilter.toLowerCase())
      && !(e.resourceId || '').toLowerCase().includes(resourceFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-sm text-gray-500">Record, state, assignment &amp; field-change history</p>
      </div>

      <div className="flex gap-3">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">All actions ({events.length})</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}
          placeholder="Filter by resource type / id…" className="input-field text-sm flex-1 max-w-md" />
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">When</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No audit events match.</td></tr>
            ) : rows.map((e) => (
              <React.Fragment key={e._id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 text-xs text-gray-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-gray-600">
                    {(e.realActorId || e.actorUserId || 'system') as string}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{e.action || '—'}</span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-gray-600">
                    {e.resourceType || '—'}{e.resourceId ? <span className="font-mono"> #{e.resourceId}</span> : ''}
                  </td>
                  <td className="px-5 py-2.5">
                    {(e.before || e.after) ? (
                      <button onClick={() => setExpanded(expanded === e._id ? null : e._id)}
                        className="text-xs text-brand-600 hover:underline">
                        {expanded === e._id ? 'Hide diff' : 'View diff'}
                      </button>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                </tr>
                {expanded === e._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-5 py-3">
                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-gray-500 mb-1">BEFORE</p>
                          <pre className="bg-white border rounded p-2 max-h-40 overflow-auto">{JSON.stringify(e.before ?? {}, null, 2)}</pre>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500 mb-1">AFTER</p>
                          <pre className="bg-white border rounded p-2 max-h-40 overflow-auto">{JSON.stringify(e.after ?? {}, null, 2)}</pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
