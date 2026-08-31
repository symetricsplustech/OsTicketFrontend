import React, { useState } from 'react';
import { useGetSaAuditLogsQuery } from '@shared/store/apiEndpoints';
import { Search, Download, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SuperAdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetSaAuditLogsQuery({ page, limit: 25, action: action || undefined, search: search || undefined });

  const logs = data?.data || [];
  const meta = data?.meta || {};

  const handleExport = () => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    window.open(`/api/v1/superadmin/audit-logs/export?${params.toString()}`, '_blank');
  };

  const actionColor = (a: string) => {
    if (a.includes('create') || a.includes('activated')) return 'bg-green-100 text-green-700';
    if (a.includes('delete') || a.includes('terminated') || a.includes('suspended')) return 'bg-red-100 text-red-700';
    if (a.includes('update') || a.includes('modified')) return 'bg-blue-100 text-blue-700';
    if (a.includes('login') || a.includes('impersonat')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Tenant lifecycle, operator actions, security events, and compliance review</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search actions, entities..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Actions</option>
          <option value="tenant">Tenant Lifecycle</option>
          <option value="plan">Plan Events</option>
          <option value="login">Login Events</option>
          <option value="impersonat">Impersonation</option>
          <option value="settings">Settings Changes</option>
          <option value="admin">Admin Actions</option>
          <option value="ticket">Tickets</option>
          <option value="user">User Events</option>
          <option value="agent">Agent Events</option>
          <option value="role">Role Changes</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No audit logs found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Entity</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Actor</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColor(log.action)}`}>{log.action}</span>
                      {log.source === 'platform' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">PLATFORM</span>}
                      {log.source === 'tenant' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">TENANT</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">{log.entityType || '-'} {log.entityId ? <span className="text-gray-400 text-xs ml-1">({String(log.entityId).slice(-6)})</span> : ''}</td>
                  <td className="px-5 py-3">
                    <span className="text-gray-700">{log.actorName || '-'}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({log.actorType})</span>
                  </td>
                  <td className="px-5 py-3">{log.company || '-'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{log.ip || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
